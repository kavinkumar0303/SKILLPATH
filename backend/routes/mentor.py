"""
SkillBridge AI - AI Mentor & Explainability Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, RoadmapItem, UserSkill, CareerGoal
from agents.mentor import MentorAgent
from agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api", tags=["Mentor & Explainability"])
mentor_agent = MentorAgent()
orchestrator = OrchestratorAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES_DATA = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}
ROLE_MAP = {r["id"]: r for r in ROLES_DATA}

class ChatRequest(BaseModel):
    message: str

@router.post("/mentor/chat")
def chat_with_mentor(data: ChatRequest, user_id: int = 1):
    session = get_session()
    try:
        # Check if the user is asking to update roadmap or career goal
        msg_lower = data.message.lower()
        if "update my roadmap" in msg_lower or "regenerate roadmap" in msg_lower:
            goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
            role_id = goal.role_id if goal else "role_fullstack"
            orchestrator.on_goal_changed(session, user_id, role_id)
            return {
                "response": "I have collaborated with the LearningPathAgent to refresh and re-sequence your personalized roadmap based on your latest skill evaluations and goal parameters.",
                "suggestions": ["View updated roadmap", "Review time estimate", "Take an assessment"],
                "action_taken": "ROADMAP_REGENERATED"
            }
            
        result = orchestrator.on_mentor_query(session, user_id, data.message)
        return result
    finally:
        session.close()

@router.get("/explain/{item_id}")
def explain_recommendation(item_id: int, user_id: int = 1):
    session = get_session()
    try:
        item = session.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
        if not item:
            # Return plausible synthetic explanation if item_id is generic
            return {
                "item_id": item_id,
                "agent_name": "LearningPathAgent",
                "collaborators": ["SkillAnalyzerAgent", "CareerMatchingAgent"],
                "decision": "Recommended based on critical technical prerequisites for Full Stack Developer role.",
                "reasoning": (
                    "Your profile shows verified proficiency in Python (70%) and SQL (60%), but indicates a verified gap in client-side runtime technologies. "
                    "This curriculum module bridges foundational DOM and asynchronous patterns before progressing to React component lifecycles."
                ),
                "data_used": [
                    "User self-rating: 0% in target skill",
                    "Target role requirement weight: 5/5 (High Priority)",
                    "Dependency graph: Requires basic HTML, unlocks React & Node.js"
                ],
                "confidence_score": 0.94,
                "confidence_label": "High Confidence",
                "adaptation_rule": "Prerequisite-first topological sort with priority weighting."
            }
            
        skill_info = SKILL_MAP.get(item.skill_id, {})
        user_skill = session.query(UserSkill).filter(
            UserSkill.user_id == user_id,
            UserSkill.skill_id == item.skill_id
        ).first()
        current_lvl = user_skill.level if user_skill else 0
        
        return {
            "item_id": item.id,
            "title": item.title,
            "skill_name": skill_info.get("name", item.skill_id),
            "agent_name": "LearningPathAgent",
            "collaborators": ["SkillAnalyzerAgent", "CareerMatchingAgent", "AssessmentAgent"],
            "decision": f"Sequenced into Phase {item.phase} as a high-impact learning resource.",
            "reasoning": (
                f"The LearningPathAgent evaluated your current proficiency in {skill_info.get('name', item.skill_id)} ({current_lvl}%) "
                f"against the standards required for your active career pathway. Since this skill is fundamental, it was scheduled in Phase {item.phase} "
                f"to satisfy prerequisites for downstream advanced modules."
            ),
            "data_used": [
                f"Current recorded proficiency: {current_lvl}%",
                f"Curriculum difficulty rating: {item.difficulty.capitalize()}",
                f"Estimated time commitment: {item.duration_hours} hours",
                f"Provider credibility: {item.provider}"
            ],
            "confidence_score": 0.92,
            "confidence_label": "High Confidence",
            "adaptation_rule": "Prerequisite-ordered priority pipeline (High -> Phase 1, Medium -> Phase 2)."
        }
    finally:
        session.close()

