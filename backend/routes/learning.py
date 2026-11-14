"""
SkillBridge AI - Learning Path & Roadmap Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, RoadmapItem, CareerGoal
from agents.learning_path import LearningPathAgent

router = APIRouter(prefix="/api", tags=["Learning Path"])
learning_agent = LearningPathAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES_DATA = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}
ROLE_MAP = {r["id"]: r for r in ROLES_DATA}

class CompleteItemRequest(BaseModel):
    item_id: int

# In-memory store for last roadmap diff
_last_diff = {
    "action": "Initial Generation",
    "timestamp": datetime.utcnow().isoformat(),
    "items_added": ["JavaScript Core Fundamentals", "React Complete Guide", "Node.js Server Architecture"],
    "items_removed": [],
    "items_reordered": ["Full-Stack Integration Capstone"],
    "summary": "Generated optimal learning path based on Python & SQL foundational proficiency"
}

def set_roadmap_diff(action: str, added: list, removed: list, reordered: list, summary: str):
    global _last_diff
    _last_diff = {
        "action": action,
        "timestamp": datetime.utcnow().isoformat(),
        "items_added": added,
        "items_removed": removed,
        "items_reordered": reordered,
        "summary": summary
    }

@router.get("/roadmap")
def get_roadmap(user_id: int = 1):
    session = get_session()
    try:
        items = session.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id
        ).order_by(RoadmapItem.phase.asc(), RoadmapItem.order.asc()).all()
        
        # If no items exist, generate them
        if not items:
            goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
            role_id = goal.role_id if goal else "role_fullstack"
            learning_agent.run(session, user_id, role_id)
            items = session.query(RoadmapItem).filter(
                RoadmapItem.user_id == user_id
            ).order_by(RoadmapItem.phase.asc(), RoadmapItem.order.asc()).all()
            
        phases_dict = {}
        for item in items:
            p = item.phase
            if p not in phases_dict:
                phases_dict[p] = []
            
            skill_info = SKILL_MAP.get(item.skill_id, {})
            phases_dict[p].append({
                "id": item.id,
                "skill_id": item.skill_id,
                "skill_name": skill_info.get("name", item.skill_id),
                "title": item.title,
                "provider": item.provider,
                "type": item.type,
                "url": item.url,
                "duration_hours": item.duration_hours,
                "difficulty": item.difficulty,
                "phase": item.phase,
                "order": item.order,
                "status": item.status,
                "completed_at": item.completed_at.isoformat() if item.completed_at else None,
                "is_revision": "Revision" in item.title or "Review" in item.title
            })
            
        phases_list = []
        phase_names = {
            1: "Phase 1: High Priority Foundations",
            2: "Phase 2: Core Engineering & Frameworks",
            3: "Phase 3: Production Tooling & Polish"
        }
        for p_num in sorted(phases_dict.keys()):
            phases_list.append({
                "phase": p_num,
                "title": phase_names.get(p_num, f"Phase {p_num}"),
                "items": phases_dict[p_num]
            })
            
        total_items = len(items)
        completed_items = sum(1 for i in items if i.status == "completed")
        total_hours = sum(i.duration_hours for i in items)
        remaining_hours = sum(i.duration_hours for i in items if i.status != "completed")
        
        return {
            "phases": phases_list,
            "total_items": total_items,
            "completed_items": completed_items,
            "total_hours": round(total_hours, 1),
            "remaining_hours": round(remaining_hours, 1),
            "completion_percentage": round((completed_items / total_items * 100), 1) if total_items > 0 else 0
        }
    finally:
        session.close()

@router.post("/roadmap/complete")
def complete_roadmap_item(data: CompleteItemRequest, user_id: int = 1):
    session = get_session()
    try:
        item = session.query(RoadmapItem).filter(
            RoadmapItem.id == data.item_id,
            RoadmapItem.user_id == user_id
        ).first()
        if not item:
            raise HTTPException(status_code=404, detail="Roadmap item not found")
        
        item.status = "completed"
        item.completed_at = datetime.utcnow()
        session.commit()
        return {"status": "success", "item_id": item.id, "title": item.title}
    finally:
        session.close()

@router.get("/roadmap/diff")
def get_roadmap_diff():
    return _last_diff

@router.get("/time-estimate")
def get_time_estimate(hours_per_week: float = 8.0, user_id: int = 1):
    session = get_session()
    try:
        items = session.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id,
            RoadmapItem.status != "completed"
        ).all()
        remaining_hours = sum(i.duration_hours for i in items)
        if remaining_hours == 0:
            remaining_hours = 60.0  # sensible baseline
            
        safe_hours_per_week = max(1.0, hours_per_week)
        estimated_weeks = round(remaining_hours / safe_hours_per_week, 1)
        
        # Target date calculation
        import datetime as dt
        target_date = dt.date.today() + dt.timedelta(weeks=int(estimated_weeks))
        
        return {
            "hours_per_week": safe_hours_per_week,
            "remaining_hours": round(remaining_hours, 1),
            "estimated_weeks": estimated_weeks,
            "target_date": target_date.strftime("%B %d, %Y"),
            "schedule_intensity": "Intensive" if safe_hours_per_week >= 15 else "Standard" if safe_hours_per_week >= 8 else "Relaxed"
        }
    finally:
        session.close()

