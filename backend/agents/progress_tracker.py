"""
SkillBridge AI – Progress Tracker Agent.
Computes overall and per-skill progress, streaks, pace, milestones.
"""

import json
import os
from datetime import datetime, timedelta

from db import (
    AgentEvent,
    AssessmentResult,
    RoadmapItem,
    UserSkill,
)

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


class ProgressTrackerAgent:
    """Computes completion %, per-skill progress, streaks and milestones."""

    def run(self, db_session, user_id: int) -> dict:
        # ---- Roadmap completion -------------------------------------------
        roadmap_items = (
            db_session.query(RoadmapItem)
            .filter(RoadmapItem.user_id == user_id)
            .all()
        )
        total_items = len(roadmap_items)
        completed_items = sum(1 for ri in roadmap_items if ri.status == "completed")
        completion_percentage = (
            round((completed_items / total_items) * 100, 1) if total_items > 0 else 0
        )

        # ---- Per-skill progress -------------------------------------------
        user_skills = (
            db_session.query(UserSkill).filter(UserSkill.user_id == user_id).all()
        )
        skills_progress = []
        for us in user_skills:
            assessments = (
                db_session.query(AssessmentResult)
                .filter(
                    AssessmentResult.user_id == user_id,
                    AssessmentResult.skill_id == us.skill_id,
                )
                .order_by(AssessmentResult.taken_at.asc())
                .all()
            )
            assessments_taken = len(assessments)
            if assessments_taken >= 2:
                prev_pct = (assessments[-2].score / assessments[-2].total * 100) if assessments[-2].total else 0
                curr_pct = (assessments[-1].score / assessments[-1].total * 100) if assessments[-1].total else 0
                trend = "improving" if curr_pct > prev_pct else "declining" if curr_pct < prev_pct else "stable"
            elif assessments_taken == 1:
                trend = "stable"
            else:
                trend = "no_data"

            skills_progress.append(
                {
                    "skill_id": us.skill_id,
                    "level": us.level,
                    "assessments_taken": assessments_taken,
                    "trend": trend,
                }
            )

        # ---- Streaks ------------------------------------------------------
        completed_dates = sorted(
            set(
                ri.completed_at.date()
                for ri in roadmap_items
                if ri.completed_at is not None
            )
        )
        current_streak = 0
        longest_streak = 0
        if completed_dates:
            streak = 1
            for i in range(1, len(completed_dates)):
                if (completed_dates[i] - completed_dates[i - 1]).days == 1:
                    streak += 1
                else:
                    longest_streak = max(longest_streak, streak)
                    streak = 1
            longest_streak = max(longest_streak, streak)

            # Current streak: consecutive days ending today or yesterday
            today = datetime.utcnow().date()
            if completed_dates[-1] >= today - timedelta(days=1):
                current_streak = 1
                for i in range(len(completed_dates) - 2, -1, -1):
                    if (completed_dates[i + 1] - completed_dates[i]).days == 1:
                        current_streak += 1
                    else:
                        break

        # ---- Pace ---------------------------------------------------------
        if completed_dates and len(completed_dates) >= 2:
            span_days = (completed_dates[-1] - completed_dates[0]).days or 1
            pace = f"{completed_items / span_days:.1f} items/day"
        elif completed_items > 0:
            pace = f"{completed_items} items completed"
        else:
            pace = "Not started"

        # ---- Milestones ---------------------------------------------------
        milestones = []
        if completed_items >= 1:
            milestones.append("First item completed")
        if completed_items >= 5:
            milestones.append("5 items completed")
        if completed_items >= 10:
            milestones.append("10 items completed")
        if completion_percentage >= 25:
            milestones.append("25% roadmap completed")
        if completion_percentage >= 50:
            milestones.append("50% roadmap completed")
        if completion_percentage >= 75:
            milestones.append("75% roadmap completed")
        if completion_percentage >= 100:
            milestones.append("Roadmap completed! 🎉")
        for sp in skills_progress:
            if sp["level"] >= 80:
                skill_name = SKILL_MAP.get(sp["skill_id"], {}).get("name", sp["skill_id"])
                milestones.append(f"Reached level 80+ in {skill_name}")

        result = {
            "completion_percentage": completion_percentage,
            "skills_progress": skills_progress,
            "total_items": total_items,
            "completed_items": completed_items,
            "streaks": {"current": current_streak, "longest": longest_streak},
            "pace": pace,
            "milestones": milestones,
        }

        # Log to agent_events
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="ProgressTrackerAgent",
                event_type="progress_tracked",
                input_summary=f"user_id={user_id}",
                output_summary=f"completion={completion_percentage}%, "
                f"{completed_items}/{total_items} items, streak={current_streak}",
            )
        )
        db_session.commit()

        return result
