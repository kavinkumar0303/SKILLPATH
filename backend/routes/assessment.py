"""
SkillBridge AI - Assessment & Testing Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, UserSkill, AssessmentResult
from agents.assessment import AssessmentAgent
from agents.orchestrator import OrchestratorAgent
from routes.learning import set_roadmap_diff

router = APIRouter(prefix="/api", tags=["Assessment"])
assessment_agent = AssessmentAgent()
orchestrator = OrchestratorAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}

class AssessmentSubmitRequest(BaseModel):
    skill_id: str
    answers: List[int]

@router.get("/assessment/{skill}")
def get_assessment(skill: str):
    # Support skill name or skill_id
    target_skill_id = skill
    if not skill.startswith("skill_"):
        for sid, sinfo in SKILL_MAP.items():
            if sinfo["name"].lower() == skill.lower():
                target_skill_id = sid
                break
                
    questions = assessment_agent.get_questions(target_skill_id, count=8)
    if not questions:
        # Fallback to general questions
        questions = assessment_agent.get_questions("skill_javascript", count=8)
        
    return {
        "skill_id": target_skill_id,
        "skill_name": SKILL_MAP.get(target_skill_id, {}).get("name", target_skill_id),
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/assessment/submit")
def submit_assessment(data: AssessmentSubmitRequest, user_id: int = 1):
    session = get_session()
    try:
        # Grade and trigger orchestrator flow
        flow_result = orchestrator.on_assessment_submitted(
            session, user_id, data.skill_id, data.answers
        )
        
        grade = flow_result.get("grade", {})
        pct = grade.get("percentage", 0)
        skill_name = SKILL_MAP.get(data.skill_id, {}).get("name", data.skill_id)
        
        adaptation_summary = ""
        action_type = ""
        
        if pct < 60:
            action_type = "Adaptive Intervention: Remediation Added"
            adaptation_summary = f"Score of {pct}% in {skill_name} triggered the LearningPathAgent to inject focused revision items and pace adjustment."
            set_roadmap_diff(
                action=action_type,
                added=[f"{skill_name}: Core Concepts Deep-Dive", f"{skill_name}: Targeted Remedial Practice"],
                removed=[],
                reordered=[f"{skill_name} Advanced Patterns (Deferred)"],
                summary=adaptation_summary
            )
        elif pct >= 85:
            action_type = "Accelerated Path: Mastery Confirmed"
            adaptation_summary = f"Score of {pct}% confirmed mastery in {skill_name}. Foundational modules marked complete, accelerating next phase."
            set_roadmap_diff(
                action=action_type,
                added=[f"Advanced {skill_name} Production Architecture"],
                removed=[f"Basic {skill_name} Syntax Primer (Auto-Completed)"],
                reordered=[],
                summary=adaptation_summary
            )
        else:
            action_type = "Path Maintained"
            adaptation_summary = f"Solid performance ({pct}%) in {skill_name}. Proceeding on standard timeline."
            
        return {
            "status": "success",
            "grade": grade,
            "adaptation": {
                "action": action_type,
                "summary": adaptation_summary,
                "weak_topics": grade.get("wrong_topics", []),
                "needs_revision": pct < 60,
                "mastered": pct >= 85
            },
            "flow_result": flow_result
        }
    finally:
        session.close()

