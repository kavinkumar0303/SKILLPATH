"""
SkillBridge AI – Skill Analyzer Agent.
Analyses user skills, computes proficiency, identifies strengths/weaknesses.
"""

import json
import os
from datetime import datetime

from db import AgentEvent, AssessmentResult, UserSkill

# Load seed data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS}

# Optional Gemini
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_KEY)
    MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class SkillAnalyzerAgent:
    """Analyses a user's skill profile and returns proficiency data."""

    def run(self, db_session, user_id: int) -> dict:
        # Fetch user skills
        user_skills = (
            db_session.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        )

        skills_data = []
        strengths = []
        weaknesses = []
        radar_data = []

        for us in user_skills:
            skill_info = SKILL_MAP.get(us.skill_id, {})
            skill_name = skill_info.get("name", us.skill_id)

            # Get latest assessment score for this skill
            latest_assessment = (
                db_session.query(AssessmentResult)
                .filter(
                    AssessmentResult.user_id == user_id,
                    AssessmentResult.skill_id == us.skill_id,
                )
                .order_by(AssessmentResult.taken_at.desc())
                .first()
            )

            if latest_assessment:
                assessment_pct = (
                    (latest_assessment.score / latest_assessment.total) * 100
                    if latest_assessment.total > 0
                    else 0
                )
                # Average of self-rated level and assessment percentage
                proficiency = round((us.level + assessment_pct) / 2)
            else:
                proficiency = us.level

            proficiency = max(0, min(100, proficiency))

            skills_data.append(
                {
                    "skill_id": us.skill_id,
                    "name": skill_name,
                    "proficiency": proficiency,
                }
            )

            if proficiency >= 70:
                strengths.append(us.skill_id)
            elif proficiency < 50:
                weaknesses.append(us.skill_id)

            radar_data.append({"skill": skill_name, "value": proficiency})

        result = {
            "skills": skills_data,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "radar_data": radar_data,
        }

        # Log to agent_events
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="SkillAnalyzerAgent",
                event_type="skill_analysis",
                input_summary=f"user_id={user_id}",
                output_summary=f"{len(skills_data)} skills analysed, "
                f"{len(strengths)} strengths, {len(weaknesses)} weaknesses",
            )
        )
        db_session.commit()

        return result
