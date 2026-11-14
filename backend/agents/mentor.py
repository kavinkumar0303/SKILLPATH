"""
SkillBridge AI – Mentor Agent.
Provides conversational mentorship via keyword rules or Gemini API.
"""

import json
import os
from datetime import datetime

from db import (
    AgentEvent,
    AssessmentResult,
    MentorMessage,
    RoadmapItem,
    UserSkill,
)

# Load seed data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "skills.json")) as f:
    SKILLS = json.load(f)
with open(os.path.join(DATA_DIR, "resources.json")) as f:
    RESOURCES = json.load(f)

SKILL_MAP = {s["id"]: s for s in SKILLS}

# Optional Gemini
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_KEY)
    GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
else:
    GEMINI_MODEL = None


class MentorAgent:
    """Provides mentorship responses – keyword-based or Gemini-powered."""

    def run(self, db_session, user_id: int, message: str) -> dict:
        # Save user message
        db_session.add(
            MentorMessage(
                user_id=user_id,
                role="user",
                content=message,
            )
        )

        if GEMINI_KEY and GEMINI_MODEL:
            response, suggestions = self._gemini_response(db_session, user_id, message)
        else:
            response, suggestions = self._rule_based_response(db_session, user_id, message)

        # Save mentor response
        db_session.add(
            MentorMessage(
                user_id=user_id,
                role="mentor",
                content=response,
            )
        )

        # Log to agent_events
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="MentorAgent",
                event_type="mentor_chat",
                input_summary=f"user_id={user_id}, msg_len={len(message)}",
                output_summary=f"response_len={len(response)}, {len(suggestions)} suggestions",
            )
        )
        db_session.commit()

        return {"response": response, "suggestions": suggestions}

    # -----------------------------------------------------------------
    # Rule-based fallback
    # -----------------------------------------------------------------
    def _rule_based_response(self, db_session, user_id: int, message: str) -> tuple[str, list]:
        msg_lower = message.lower()
        suggestions: list[str] = []

        # --- "stuck" / "help" / "frustrated" ---
        if any(kw in msg_lower for kw in ("stuck", "frustrated", "confused", "hard", "difficult", "struggle")):
            response = (
                "It's completely normal to feel stuck sometimes — every developer goes through it! "
                "Try breaking the problem into smaller pieces, take a short break, and come back "
                "with fresh eyes. Revisiting fundamentals often helps too. You've got this! 💪"
            )
            suggestions = [
                "Review the basics of the topic you're struggling with",
                "Try a hands-on coding exercise instead of reading",
                "Take a 15-minute break and come back",
            ]
            return response, suggestions

        # --- "resource" / "learn" / "course" / "tutorial" ---
        if any(kw in msg_lower for kw in ("resource", "learn", "course", "tutorial", "recommend", "study")):
            # Find user's weakest skill and recommend resources
            user_skills = (
                db_session.query(UserSkill)
                .filter(UserSkill.user_id == user_id)
                .order_by(UserSkill.level.asc())
                .all()
            )
            if user_skills:
                weakest = user_skills[0]
                skill_name = SKILL_MAP.get(weakest.skill_id, {}).get("name", weakest.skill_id)
                skill_resources = [r for r in RESOURCES if r.get("skill_id") == weakest.skill_id][:3]
                resource_list = "\n".join(
                    f"  • {r['title']} ({r['provider']}) – {r.get('url', 'N/A')}"
                    for r in skill_resources
                )
                response = (
                    f"Based on your profile, I'd suggest focusing on **{skill_name}** "
                    f"(currently at level {weakest.level}). Here are some great free resources:\n{resource_list}"
                )
                suggestions = [r["title"] for r in skill_resources]
            else:
                response = (
                    "Add some skills to your profile first, and I'll be able to recommend "
                    "personalised learning resources for you!"
                )
            return response, suggestions

        # --- "progress" / "how am i doing" ---
        if any(kw in msg_lower for kw in ("progress", "how am i", "status", "doing", "score")):
            completed = (
                db_session.query(RoadmapItem)
                .filter(RoadmapItem.user_id == user_id, RoadmapItem.status == "completed")
                .count()
            )
            total = (
                db_session.query(RoadmapItem)
                .filter(RoadmapItem.user_id == user_id)
                .count()
            )
            assessments = (
                db_session.query(AssessmentResult)
                .filter(AssessmentResult.user_id == user_id)
                .count()
            )
            if total > 0:
                pct = round(completed / total * 100, 1)
                response = (
                    f"Great question! Here's your snapshot:\n"
                    f"📊 Roadmap progress: {completed}/{total} items ({pct}%)\n"
                    f"📝 Assessments taken: {assessments}\n"
                    f"Keep up the momentum!"
                )
            else:
                response = (
                    "You haven't started your learning roadmap yet. "
                    "Select a career goal to generate your personalised path!"
                )
            suggestions = ["Take an assessment", "View my roadmap", "Check my skill analysis"]
            return response, suggestions

        # --- "goal" / "career" ---
        if any(kw in msg_lower for kw in ("goal", "career", "role", "job", "future")):
            response = (
                "Setting clear career goals is the first step to success! "
                "Explore the available roles in Skillpath and select one that excites you. "
                "I'll help you build a personalised roadmap to get there."
            )
            suggestions = ["Explore career roles", "Check my career match", "View skill gaps"]
            return response, suggestions

        # --- "hello" / greeting ---
        if any(kw in msg_lower for kw in ("hello", "hi", "hey", "good morning", "good evening")):
            response = (
                "Hey there! 👋 I'm your AI mentor. I can help you with learning resources, "
                "track your progress, discuss career goals, or just chat about your learning journey. "
                "What would you like to know?"
            )
            suggestions = ["How am I doing?", "Suggest resources", "Help me set a goal"]
            return response, suggestions

        # --- default ---
        response = (
            "Thanks for reaching out! I'm here to support your learning journey. "
            "You can ask me about resources, your progress, career goals, or just let me know "
            "if you're feeling stuck. I'm always happy to help! 😊"
        )
        suggestions = [
            "What resources should I study?",
            "How is my progress?",
            "I'm feeling stuck",
        ]
        return response, suggestions

    # -----------------------------------------------------------------
    # Gemini-powered response
    # -----------------------------------------------------------------
    def _gemini_response(self, db_session, user_id: int, message: str) -> tuple[str, list]:
        try:
            # Build context
            user_skills = (
                db_session.query(UserSkill)
                .filter(UserSkill.user_id == user_id)
                .all()
            )
            skill_summary = ", ".join(
                f"{SKILL_MAP.get(us.skill_id, {}).get('name', us.skill_id)}: {us.level}/100"
                for us in user_skills
            )

            prompt = (
                "You are a friendly, encouraging AI learning mentor for a student on Skillpath. "
                f"Their current skills: {skill_summary}. "
                f"Student says: \"{message}\"\n\n"
                "Respond with helpful, personalised advice (2-4 sentences). "
                "Also return 2-3 short action suggestions as a JSON array in the last line, "
                "prefixed with 'SUGGESTIONS:'. Example: SUGGESTIONS:[\"Take a quiz\",\"Read docs\"]"
            )

            model = genai.GenerativeModel(GEMINI_MODEL)
            result = model.generate_content(prompt)
            text = result.text.strip()

            # Parse suggestions from last line
            suggestions = []
            lines = text.split("\n")
            for line in reversed(lines):
                if line.strip().startswith("SUGGESTIONS:"):
                    try:
                        suggestions = json.loads(line.strip().replace("SUGGESTIONS:", ""))
                    except json.JSONDecodeError:
                        pass
                    text = "\n".join(l for l in lines if not l.strip().startswith("SUGGESTIONS:"))
                    break

            return text.strip(), suggestions
        except Exception:
            # Fallback to rule-based
            return self._rule_based_response(db_session, user_id, message)
