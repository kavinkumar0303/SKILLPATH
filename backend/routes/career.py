"""
SkillBridge AI - Career & Simulator Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, CareerGoal, UserSkill
from agents.career_matching import CareerMatchingAgent
from agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api", tags=["Career"])
matching_agent = CareerMatchingAgent()
orchestrator = OrchestratorAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)

ROLE_MAP = {r["id"]: r for r in ROLES_DATA}
SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}

class CareerSelect(BaseModel):
    role_id: str

class SimulateRequest(BaseModel):
    role_id: str

@router.get("/roles")
def get_roles():
    return ROLES_DATA

@router.post("/career/select")
def select_career_goal(data: CareerSelect, user_id: int = 1):
    session = get_session()
    try:
        role = ROLE_MAP.get(data.role_id)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role {data.role_id} not found")
        
        # Deactivate existing active goals
        goals = session.query(CareerGoal).filter(CareerGoal.user_id == user_id).all()
        for g in goals:
            g.active = False
        
        # Add new goal
        new_goal = CareerGoal(user_id=user_id, role_id=data.role_id, active=True)
        session.add(new_goal)
        session.commit()
        
        # Trigger orchestrator flow: GOAL_CHANGED
        flow_result = orchestrator.on_goal_changed(session, user_id, data.role_id)
        
        return {
            "status": "success",
            "message": f"Career goal updated to {role['name']}",
            "role": role,
            "flow_result": flow_result
        }
    finally:
        session.close()

@router.post("/simulate")
def simulate_career_goal(data: SimulateRequest, user_id: int = 1):
    session = get_session()
    try:
        target_role = ROLE_MAP.get(data.role_id)
        if not target_role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Current active goal
        current_goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
        current_role_id = current_goal.role_id if current_goal else "role_fullstack"
        current_role = ROLE_MAP.get(current_role_id, {})
        
        # Run matching for both without mutating state
        current_match = matching_agent.run(session, user_id, current_role_id)
        simulated_match = matching_agent.run(session, user_id, data.role_id)
        
        # Enrich skill objects with names
        for item in simulated_match.get("matched_skills", []):
            item["name"] = SKILL_MAP.get(item["skill_id"], {}).get("name", item["skill_id"])
        for item in simulated_match.get("missing_skills", []):
            item["name"] = SKILL_MAP.get(item["skill_id"], {}).get("name", item["skill_id"])
            
        for item in current_match.get("matched_skills", []):
            item["name"] = SKILL_MAP.get(item["skill_id"], {}).get("name", item["skill_id"])
        for item in current_match.get("missing_skills", []):
            item["name"] = SKILL_MAP.get(item["skill_id"], {}).get("name", item["skill_id"])
            
        # Estimate learning hours for simulated role
        # roughly 15 hours per missing skill
        missing_count = len(simulated_match.get("missing_skills", []))
        total_hours_est = missing_count * 20
        est_weeks_at_8h = max(2, round(total_hours_est / 8))
        est_weeks_at_12h = max(2, round(total_hours_est / 12))
        
        return {
            "simulated_role": target_role,
            "current_role": current_role,
            "simulated_match": simulated_match,
            "current_match": current_match,
            "estimated_hours": total_hours_est,
            "estimated_weeks": est_weeks_at_8h,
            "estimated_weeks_accelerated": est_weeks_at_12h,
            "comparison": {
                "match_difference": round(simulated_match["match_percentage"] - current_match["match_percentage"], 1),
                "additional_missing_skills": [
                    s["name"] for s in simulated_match.get("missing_skills", [])
                    if s["skill_id"] not in [x["skill_id"] for x in current_match.get("missing_skills", [])]
                ]
            }
        }
    finally:
        session.close()

