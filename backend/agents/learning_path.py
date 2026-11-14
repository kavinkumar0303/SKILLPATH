"""
SkillBridge AI – Learning Path Agent.
Generates a phased roadmap of learning resources for a user pursuing a role.
"""

import json
import os
from datetime import datetime

from db import AgentEvent, RoadmapItem, UserSkill

# Load seed data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES = json.load(f)
with open(os.path.join(DATA_DIR, "resources.json")) as f:
    RESOURCES = json.load(f)
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS = json.load(f)

ROLE_MAP = {r["id"]: r for r in ROLES}
SKILL_MAP = {s["id"]: s for s in SKILLS}
# Group resources by skill_id
RESOURCES_BY_SKILL: dict[str, list] = {}
for res in RESOURCES:
    sid = res.get("skill_id", "")
    RESOURCES_BY_SKILL.setdefault(sid, []).append(res)

PRIORITY_TO_PHASE = {"High": 1, "Medium": 2, "Low": 3}

# Optional Gemini
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_KEY)
    MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class LearningPathAgent:
    """Generates a phased learning roadmap for a user targeting a role."""

    def run(self, db_session, user_id: int, role_id: str) -> dict:
        role = ROLE_MAP.get(role_id)
        if not role:
            return {"phases": [], "error": f"Role '{role_id}' not found"}

        # Gather user skill levels
        user_skills = (
            db_session.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        )
        user_skill_map = {us.skill_id: us.level for us in user_skills}

        required_skills = role.get("required_skills", [])

        # Identify skills that are missing or weak (< 70)
        skills_to_learn: list[dict] = []
        for rs in required_skills:
            skill_id = rs["skill_id"]
            user_level = user_skill_map.get(skill_id, 0)
            if user_level < 70:
                skills_to_learn.append(
                    {
                        "skill_id": skill_id,
                        "priority": rs.get("priority", "Medium"),
                        "weight": rs.get("weight", 1),
                        "current_level": user_level,
                    }
                )

        # Sort: High priority first, then by weight descending
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        skills_to_learn.sort(
            key=lambda s: (priority_order.get(s["priority"], 1), -s["weight"])
        )

        # Resolve prerequisites – ensure prerequisite skills appear before dependants
        ordered_skill_ids: list[str] = []
        visited: set[str] = set()

        def _add_with_prereqs(sid: str):
            if sid in visited:
                return
            visited.add(sid)
            skill_info = SKILL_MAP.get(sid, {})
            for prereq in skill_info.get("prerequisites", []):
                # Only add prerequisite if it is also a weak/missing skill
                if prereq not in visited and user_skill_map.get(prereq, 0) < 70:
                    _add_with_prereqs(prereq)
            ordered_skill_ids.append(sid)

        for stl in skills_to_learn:
            _add_with_prereqs(stl["skill_id"])

        # Build priority lookup
        priority_map = {s["skill_id"]: s["priority"] for s in skills_to_learn}

        # Clear existing roadmap items for this user (regenerate)
        db_session.query(RoadmapItem).filter(
            RoadmapItem.user_id == user_id
        ).delete()

        # Build phases
        phases: dict[int, list] = {1: [], 2: [], 3: []}
        global_order = 0

        for skill_id in ordered_skill_ids:
            priority = priority_map.get(skill_id, "Medium")
            phase = PRIORITY_TO_PHASE.get(priority, 2)
            resources = RESOURCES_BY_SKILL.get(skill_id, [])

            # Sort resources: beginner -> intermediate -> advanced
            diff_order = {"beginner": 0, "intermediate": 1, "advanced": 2}
            resources.sort(key=lambda r: diff_order.get(r.get("difficulty", "beginner"), 0))

            for res in resources:
                global_order += 1
                item = {
                    "title": res.get("title", "Untitled"),
                    "provider": res.get("provider", "Unknown"),
                    "type": res.get("type", "course"),
                    "url": res.get("url", ""),
                    "duration": res.get("duration_hours", 1),
                    "difficulty": res.get("difficulty", "beginner"),
                    "skill_id": skill_id,
                    "order": global_order,
                    "status": "pending",
                }
                phases[phase].append(item)

                # Persist to DB
                db_session.add(
                    RoadmapItem(
                        user_id=user_id,
                        skill_id=skill_id,
                        title=item["title"],
                        provider=item["provider"],
                        type=item["type"],
                        url=item["url"],
                        duration_hours=item["duration"],
                        difficulty=item["difficulty"],
                        phase=phase,
                        order=global_order,
                        status="pending",
                    )
                )

        # Build output
        result_phases = []
        for phase_num in [1, 2, 3]:
            if phases[phase_num]:
                result_phases.append(
                    {"phase": phase_num, "items": phases[phase_num]}
                )

        # Log to agent_events
        total_items = sum(len(p) for p in phases.values())
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="LearningPathAgent",
                event_type="learning_path_generated",
                input_summary=f"user_id={user_id}, role_id={role_id}",
                output_summary=f"{total_items} items across {len(result_phases)} phases",
            )
        )
        db_session.commit()

        return {"phases": result_phases}
