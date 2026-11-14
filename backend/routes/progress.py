"""
SkillBridge AI - Progress, Revision, Planner & Projects Routes
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from db import get_session, AssessmentResult, RevisionItem, RoadmapItem, CareerGoal
from agents.progress_tracker import ProgressTrackerAgent

router = APIRouter(prefix="/api", tags=["Progress & Schedule"])
progress_agent = ProgressTrackerAgent()

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "assessments.json")) as f:
    ASSESSMENTS_DATA = json.load(f)
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES_DATA = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS_DATA}
QUESTION_MAP = {q["id"]: q for q in ASSESSMENTS_DATA}
ROLE_MAP = {r["id"]: r for r in ROLES_DATA}

@router.get("/progress")
def get_progress(user_id: int = 1):
    session = get_session()
    try:
        data = progress_agent.run(session, user_id)
        
        # Historical assessments for charts
        assessments = session.query(AssessmentResult).filter(
            AssessmentResult.user_id == user_id
        ).order_by(AssessmentResult.taken_at.asc()).all()
        
        history = []
        for a in assessments:
            s_name = SKILL_MAP.get(a.skill_id, {}).get("name", a.skill_id)
            history.append({
                "date": a.taken_at.strftime("%b %d"),
                "skill": s_name,
                "score_pct": round((a.score / a.total * 100), 1) if a.total else 0,
                "raw": f"{a.score}/{a.total}"
            })
            
        # Weekly study activity mock/stored
        weekly_activity = [
            {"day": "Mon", "hours": 1.5, "modules": 2},
            {"day": "Tue", "hours": 2.0, "modules": 3},
            {"day": "Wed", "hours": 1.0, "modules": 1},
            {"day": "Thu", "hours": 2.5, "modules": 4},
            {"day": "Fri", "hours": 1.5, "modules": 2},
            {"day": "Sat", "hours": 3.0, "modules": 5},
            {"day": "Sun", "hours": 2.0, "modules": 3},
        ]
        
        data["assessment_history"] = history
        data["weekly_activity"] = weekly_activity
        
        # Format skills_progress with names
        for sp in data.get("skills_progress", []):
            sp["name"] = SKILL_MAP.get(sp["skill_id"], {}).get("name", sp["skill_id"])
            
        return data
    finally:
        session.close()

@router.get("/revision/due")
def get_revision_due(user_id: int = 1):
    session = get_session()
    try:
        revisions = session.query(RevisionItem).filter(
            RevisionItem.user_id == user_id
        ).all()
        
        items = []
        for rev in revisions:
            q = QUESTION_MAP.get(rev.question_id, {})
            skill_info = SKILL_MAP.get(rev.skill_id, {})
            items.append({
                "id": rev.id,
                "skill_id": rev.skill_id,
                "skill_name": skill_info.get("name", rev.skill_id),
                "question": q.get("question", "Review core technical concepts for " + skill_info.get("name", rev.skill_id)),
                "interval_days": rev.interval_days,
                "due_date": rev.next_review.strftime("%b %d, %Y"),
                "is_due_today": True,
                "explanation": q.get("explanation", "Spaced review to solidify memory retention and eliminate conceptual gaps.")
            })
            
        # If no real revisions yet, provide 2 seed revision items for Arjun Kumar
        if not items:
            items = [
                {
                    "id": 101,
                    "skill_id": "skill_javascript",
                    "skill_name": "JavaScript",
                    "question": "What is the key difference between Promise.all() and Promise.allSettled()?",
                    "interval_days": 1,
                    "due_date": "Today",
                    "is_due_today": True,
                    "explanation": "Promise.all rejects immediately if any promise rejects, whereas Promise.allSettled waits for all promises to resolve or reject."
                },
                {
                    "id": 102,
                    "skill_id": "skill_react",
                    "skill_name": "React",
                    "question": "Why should useEffect dependencies always include all reactive values used inside the effect?",
                    "interval_days": 3,
                    "due_date": "Today",
                    "is_due_today": True,
                    "explanation": "Omitting dependencies leads to stale closures where the effect accesses outdated props or state values."
                }
            ]
            
        return {
            "total_due": len(items),
            "items": items
        }
    finally:
        session.close()

@router.get("/planner")
def get_weekly_planner(hours_per_week: float = 8.0, user_id: int = 1):
    session = get_session()
    try:
        # Schedule items across 7 days
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        schedule = []
        
        items = session.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id,
            RoadmapItem.status != "completed"
        ).order_by(RoadmapItem.phase.asc(), RoadmapItem.order.asc()).limit(7).all()
        
        time_slots = ["09:00 - 10:30", "18:00 - 19:30", "19:00 - 20:30", "18:30 - 20:00", "17:00 - 18:30", "10:00 - 12:30", "11:00 - 13:00"]
        
        for i, day in enumerate(days):
            roadmap_item = items[i % len(items)] if items else None
            title = roadmap_item.title if roadmap_item else "Independent Practice & Review"
            provider = roadmap_item.provider if roadmap_item else "Skillpath Sandbox"
            duration = 1.5 if i < 5 else 2.5
            skill_id = roadmap_item.skill_id if roadmap_item else "skill_javascript"
            
            schedule.append({
                "id": i + 1,
                "day": day,
                "time_slot": time_slots[i],
                "task": title,
                "provider": provider,
                "skill_name": SKILL_MAP.get(skill_id, {}).get("name", "Technical Skill"),
                "allocated_hours": duration,
                "completed": i == 0  # Mon completed
            })
            
        return {
            "weekly_hours_target": hours_per_week,
            "allocated_hours_total": sum(s["allocated_hours"] for s in schedule),
            "schedule": schedule
        }
    finally:
        session.close()

@router.get("/streaks")
def get_streaks(user_id: int = 1):
    return {
        "current_streak_days": 7,
        "longest_streak_days": 14,
        "total_active_days": 26,
        "completion_velocity": "3.4 modules / week",
        "milestones": [
            {
                "id": "m1",
                "title": "7-Day Continuous Study Cadence",
                "category": "Discipline",
                "achieved": True,
                "date": "Yesterday",
                "description": "Maintained daily technical learning without interruption"
            },
            {
                "id": "m2",
                "title": "First Technical Diagnostic Cleared",
                "category": "Evaluation",
                "achieved": True,
                "date": "3 days ago",
                "description": "Passed Python & SQL assessment with >=70% score"
            },
            {
                "id": "m3",
                "title": "Phase 1 Foundation Mastery",
                "category": "Curriculum",
                "achieved": False,
                "progress": 65,
                "description": "Complete all foundational modules in active roadmap"
            },
            {
                "id": "m4",
                "title": "Full-Stack Project Milestone",
                "category": "Portfolio",
                "achieved": False,
                "progress": 30,
                "description": "Deliver end-to-end task tracker with backend API & database"
            }
        ]
    }

@router.get("/projects")
def get_capstone_projects(user_id: int = 1):
    session = get_session()
    try:
        goal = session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
        role_id = goal.role_id if goal else "role_fullstack"
        role_name = ROLE_MAP.get(role_id, {}).get("name", "Full Stack Developer")
        
        projects = [
            {
                "id": "proj_1",
                "title": "Enterprise Micro-Task & Collaboration Engine",
                "role": role_name,
                "description": "Production-grade task management system with real-time updates, role-based access control, RESTful API backend, and relational database persistence.",
                "difficulty": "Intermediate",
                "estimated_hours": 24,
                "skills_covered": ["JavaScript", "React", "Node.js", "SQL", "REST APIs"],
                "checklist": [
                    {"id": "c1", "task": "Design normalized PostgreSQL / SQLite relational schema", "done": True},
                    {"id": "c2", "task": "Implement Express / FastAPI REST endpoints with JWT authentication", "done": True},
                    {"id": "c3", "task": "Build responsive React dashboard with optimistic UI updates", "done": False},
                    {"id": "c4", "task": "Add end-to-end automated API regression test suite", "done": False},
                    {"id": "c5", "task": "Containerize full application with Docker & docker-compose", "done": False}
                ],
                "readiness_boost": "+12 points"
            },
            {
                "id": "proj_2",
                "title": "Distributed Metrics & Telemetry Visualizer",
                "role": role_name,
                "description": "Real-time analytics dashboard aggregating system telemetry, supporting custom query filters and responsive data visualization graphs.",
                "difficulty": "Advanced",
                "estimated_hours": 32,
                "skills_covered": ["React", "TypeScript", "Node.js", "Docker", "Database Design"],
                "checklist": [
                    {"id": "c6", "task": "Architect event ingestion queue and rate limiter", "done": False},
                    {"id": "c7", "task": "Construct interactive multi-series chart component", "done": False},
                    {"id": "c8", "task": "Implement caching layer with Redis for high-frequency queries", "done": False}
                ],
                "readiness_boost": "+18 points"
            }
        ]
        return projects
    finally:
        session.close()

