"""
SkillBridge AI – Career Matching Agent.
Computes match percentage between user skills and target role requirements.
"""

import json
import os

from db import AgentEvent, UserSkill

# Load seed data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "roles.json")) as f:
    ROLES = json.load(f)

ROLE_MAP = {r["id"]: r for r in ROLES}

# Optional Gemini
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_KEY)
    MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class CareerMatchingAgent:
    """Computes weighted match between user skills and a target role."""

    def run(self, db_session, user_id: int, role_id: str) -> dict:
        role = ROLE_MAP.get(role_id)
        if not role:
            return {
                "match_percentage": 0,
                "matched_skills": [],
                "missing_skills": [],
                "total_weight": 0,
                "achieved_weight": 0,
                "error": f"Role '{role_id}' not found",
            }

        # Build a lookup of user skill levels
        user_skills = (
            db_session.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        )
        user_skill_map = {us.skill_id: us.level for us in user_skills}

        required_skills = role.get("required_skills", [])
        total_weight = sum(rs.get("weight", 1) for rs in required_skills)
        achieved_weight = 0.0
        matched_skills = []
        missing_skills = []

        for rs in required_skills:
            skill_id = rs["skill_id"]
            weight = rs.get("weight", 1)
            priority = rs.get("priority", "Medium")
            user_level = user_skill_map.get(skill_id, 0)

            if user_level > 0:
                # Partial credit: level/100 * weight
                credit = (user_level / 100) * weight
                achieved_weight += credit
                status = "strong" if user_level >= 70 else "developing" if user_level >= 40 else "weak"
                matched_skills.append(
                    {
                        "skill_id": skill_id,
                        "weight": weight,
                        "user_level": user_level,
                        "status": status,
                    }
                )
            else:
                missing_skills.append(
                    {
                        "skill_id": skill_id,
                        "weight": weight,
                        "priority": priority,
                    }
                )

        match_percentage = round((achieved_weight / total_weight) * 100, 1) if total_weight > 0 else 0

        result = {
            "match_percentage": match_percentage,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "total_weight": total_weight,
            "achieved_weight": round(achieved_weight, 2),
        }

        # Log to agent_events
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="CareerMatchingAgent",
                event_type="career_matching",
                input_summary=f"user_id={user_id}, role_id={role_id}",
                output_summary=f"match={match_percentage}%, "
                f"{len(matched_skills)} matched, {len(missing_skills)} missing",
            )
        )
        db_session.commit()

        return result
