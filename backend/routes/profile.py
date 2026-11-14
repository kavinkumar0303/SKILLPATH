"""
SkillBridge AI - Profile Routes
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, User, UserSkill, CareerGoal, init_db
from agents.orchestrator import OrchestratorAgent

from auth import get_current_user

router = APIRouter(prefix="/api", tags=["Profile"])
orchestrator = OrchestratorAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)
SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    education: Optional[str] = None

class SkillAdd(BaseModel):
    skill_id: str
    level: int  # 0-100

class ResumeUpload(BaseModel):
    text: str

@router.get("/profile")
def get_profile(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    uid = user_id if user_id is not None else current_user.id
    session = get_session()
    try:
        user = session.query(User).filter(User.id == uid).first()
        if not user:
            user = current_user
        
        skills = []
        for us in user.skills:
            info = SKILL_MAP.get(us.skill_id, {})
            skills.append({
                "skill_id": us.skill_id,
                "name": info.get("name", us.skill_id),
                "category": info.get("category", "General"),
                "level": us.level
            })
        
        goal = session.query(CareerGoal).filter(CareerGoal.user_id == uid, CareerGoal.active == True).first()
        
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "bio": user.bio or "",
            "phone": user.phone or "",
            "location": user.location or "",
            "linkedin": user.linkedin or "",
            "github": user.github or "",
            "avatar": user.avatar or "",
            "education": user.education or "[]",
            "target_role": goal.role_id if goal else "role_fullstack",
            "skills": skills
        }
    finally:
        session.close()

@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    uid = user_id if user_id is not None else current_user.id
    session = get_session()
    try:
        user = session.query(User).filter(User.id == uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if data.name is not None:
            user.name = data.name
        if data.email is not None:
            user.email = data.email
        if data.bio is not None:
            user.bio = data.bio
        if data.phone is not None:
            user.phone = data.phone
        if data.location is not None:
            user.location = data.location
        if data.linkedin is not None:
            user.linkedin = data.linkedin
        if data.github is not None:
            user.github = data.github
        if data.education is not None:
            user.education = data.education
        session.commit()
        orchestrator.on_profile_updated(session, uid)
        return {"status": "success", "message": "Profile updated"}
    finally:
        session.close()

@router.post("/profile/skills")
def add_skill(
    data: SkillAdd,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    uid = user_id if user_id is not None else current_user.id
    session = get_session()
    try:
        user = session.query(User).filter(User.id == uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        existing = session.query(UserSkill).filter(
            UserSkill.user_id == uid,
            UserSkill.skill_id == data.skill_id
        ).first()
        
        if existing:
            existing.level = max(0, min(100, data.level))
        else:
            session.add(UserSkill(user_id=uid, skill_id=data.skill_id, level=max(0, min(100, data.level))))
        session.commit()
        
        # Trigger orchestrator
        orchestrator.on_profile_updated(session, uid)
        return {"status": "success", "message": f"Skill {data.skill_id} saved"}
    finally:
        session.close()

@router.delete("/profile/skills/{skill_id}")
def delete_skill(
    skill_id: str,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    uid = user_id if user_id is not None else current_user.id
    session = get_session()
    try:
        existing = session.query(UserSkill).filter(
            UserSkill.user_id == uid,
            UserSkill.skill_id == skill_id
        ).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Skill not found in profile")
        session.delete(existing)
        session.commit()
        
        orchestrator.on_profile_updated(session, uid)
        return {"status": "success", "message": f"Skill {skill_id} removed"}
    finally:
        session.close()

@router.post("/profile/resume")
def upload_resume(
    data: ResumeUpload,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    uid = user_id if user_id is not None else current_user.id
    session = get_session()
    try:
        result = orchestrator.on_resume_uploaded(session, uid, data.text)
        return {
            "status": "success",
            "extracted_skills": result.get("extracted_skills", []),
            "message": f"Extracted {len(result.get('extracted_skills', []))} skills from resume"
        }
    finally:
        session.close()

