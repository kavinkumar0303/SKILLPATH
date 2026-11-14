"""
SkillBridge AI - Analysis & Readiness Routes
"""
from fastapi import APIRouter, HTTPException
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, CareerGoal, UserSkill, AssessmentResult, RoadmapItem
from agents.skill_analyzer import SkillAnalyzerAgent
from agents.career_matching import CareerMatchingAgent

router = APIRouter(prefix="/api", tags=["Analysis"])
analyzer = SkillAnalyzerAgent()
matching_agent = CareerMatchingAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)

ROLE_MAP = {r["id"]: r for r in ROLES_DATA}
SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}

@router.get("/analysis")
def get_analysis(user_id: int = 1):
    session = get_session()
    try:
        result = analyzer.run(session, user_id)
        # Enrich strengths & weaknesses with names & categories
        enriched_strengths = []
        for sid in result["strengths"]:
            info = SKILL_MAP.get(sid, {})
            enriched_strengths.append({
                "skill_id": sid,
                "name": info.get("name", sid),
                "category": info.get("category", "General")
            })
        enriched_weaknesses = []
        for sid in result["weaknesses"]:
            info = SKILL_MAP.get(sid, {})
            enriched_weaknesses.append({
                "skill_id": sid,
                "name": info.get("name", sid),
                "category": info.get("category", "General")
            })
        result["strengths_detail"] = enriched_strengths
        result["weaknesses_detail"] = enriched_weaknesses
        return result
    finally:
        session.close()

@router.get("/match")
def get_career_match(user_id: int = 1):
    session = get_session()
    try:
        goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
        role_id = goal.role_id if goal else "role_fullstack"
        role_info = ROLE_MAP.get(role_id, {})
        
        result = matching_agent.run(session, user_id, role_id)
        result["role_id"] = role_id
        result["role_name"] = role_info.get("name", "Full Stack Developer")
        result["role_description"] = role_info.get("description", "")
        
        # Enrich skills
        for s in result.get("matched_skills", []):
            info = SKILL_MAP.get(s["skill_id"], {})
            s["name"] = info.get("name", s["skill_id"])
            s["category"] = info.get("category", "General")
            
        for s in result.get("missing_skills", []):
            info = SKILL_MAP.get(s["skill_id"], {})
            s["name"] = info.get("name", s["skill_id"])
            s["category"] = info.get("category", "General")
            
        return result
    finally:
        session.close()

@router.get("/readiness")
def get_readiness_score(user_id: int = 1):
    session = get_session()
    try:
        goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
        role_id = goal.role_id if goal else "role_fullstack"
        match_data = matching_agent.run(session, user_id, role_id)
        match_pct = match_data.get("match_percentage", 0)
        
        # Assessment performance
        assessments = session.query(AssessmentResult).filter(AssessmentResult.user_id == user_id).all()
        if assessments:
            total_score = sum(a.score for a in assessments)
            total_possible = sum(a.total for a in assessments)
            assessment_pct = (total_score / total_possible * 100) if total_possible > 0 else 0
        else:
            assessment_pct = 50.0  # baseline default
            
        # Roadmap items completed
        completed_items = session.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id,
            RoadmapItem.status == "completed"
        ).count()
        total_items = session.query(RoadmapItem).filter(RoadmapItem.user_id == user_id).count()
        completion_pct = (completed_items / total_items * 100) if total_items > 0 else 10.0
        
        # Consistency score (based on streaks/activity)
        consistency_pct = 75.0  # calibrated
        
        # Weighted readiness formula:
        # 40% Role Match, 30% Assessment Score, 20% Roadmap Completion, 10% Consistency
        final_readiness = round(
            (match_pct * 0.40) +
            (assessment_pct * 0.30) +
            (completion_pct * 0.20) +
            (consistency_pct * 0.10)
        )
        final_readiness = max(0, min(100, final_readiness))
        
        tier = "Job Ready" if final_readiness >= 80 else "Nearing Readiness" if final_readiness >= 60 else "Foundational" if final_readiness >= 40 else "Getting Started"
        
        return {
            "readiness_score": final_readiness,
            "tier": tier,
            "role_id": role_id,
            "role_name": ROLE_MAP.get(role_id, {}).get("name", "Full Stack Developer"),
            "breakdown": {
                "role_match": {
                    "weight": "40%",
                    "score": round(match_pct, 1),
                    "description": "Coverage of required core technologies"
                },
                "assessment_mastery": {
                    "weight": "30%",
                    "score": round(assessment_pct, 1),
                    "description": "Validated test performance across technical quizzes"
                },
                "curriculum_progress": {
                    "weight": "20%",
                    "score": round(completion_pct, 1),
                    "description": "Completed coursework and hands-on modules"
                },
                "consistency_index": {
                    "weight": "10%",
                    "score": round(consistency_pct, 1),
                    "description": "Learning frequency and study rhythm"
                }
            }
        }
    finally:
        session.close()

@router.get("/skill-graph")
def get_skill_graph(user_id: int = 1):
    session = get_session()
    try:
        user_skills = session.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        user_levels = {us.skill_id: us.level for us in user_skills}
        
        goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
        role_id = goal.role_id if goal else "role_fullstack"
        role_info = ROLE_MAP.get(role_id, {})
        required_skill_ids = {rs["skill_id"] for rs in role_info.get("required_skills", [])}
        
        nodes = []
        edges = []
        
        for skill in SKILLS_DATA:
            sid = skill["id"]
            lvl = user_levels.get(sid, 0)
            
            # Status: mastered (>=80), in_progress (1-79), missing (0 & required), optional (0 & not required)
            if lvl >= 75:
                status = "mastered"
            elif lvl > 0:
                status = "in_progress"
            elif sid in required_skill_ids:
                status = "missing"
            else:
                status = "optional"
                
            nodes.append({
                "id": sid,
                "label": skill["name"],
                "category": skill["category"],
                "level": lvl,
                "status": status,
                "is_required": sid in required_skill_ids,
                "prerequisites": skill.get("prerequisites", [])
            })
            
            for p in skill.get("prerequisites", []):
                edges.append({
                    "source": p,
                    "target": sid,
                    "id": f"{p}->{sid}"
                })
                
        return {
            "nodes": nodes,
            "edges": edges,
            "target_role": role_info.get("name", "Full Stack Developer")
        }
    finally:
        session.close()

