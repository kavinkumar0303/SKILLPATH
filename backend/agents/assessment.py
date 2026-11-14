"""
SkillBridge AI – Assessment Agent.
Serves quiz questions and grades submissions.
"""

import json
import os
from datetime import datetime

from db import AgentEvent, AssessmentResult

# Load seed data
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
with open(os.path.join(DATA_DIR, "assessments.json")) as f:
    ASSESSMENTS = json.load(f)

# Group questions by skill_id
QUESTIONS_BY_SKILL: dict[str, list] = {}
for q in ASSESSMENTS:
    sid = q.get("skill_id", "")
    QUESTIONS_BY_SKILL.setdefault(sid, []).append(q)

# Optional Gemini
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_KEY:
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_KEY)
    MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


class AssessmentAgent:
    """Serves MCQ assessments and grades answers."""

    def get_questions(self, skill_id: str, count: int = 8) -> list[dict]:
        """Return up to *count* questions for a skill from the seed bank."""
        questions = QUESTIONS_BY_SKILL.get(skill_id, [])
        selected = questions[:count]
        # Strip correct_answer and explanation for the client
        return [
            {
                "id": q["id"],
                "skill_id": q["skill_id"],
                "question": q["question"],
                "options": q["options"],
                "difficulty": q.get("difficulty", "medium"),
            }
            for q in selected
        ]

    def grade(
        self,
        db_session,
        user_id: int,
        skill_id: str,
        answers: list[int],
    ) -> dict:
        """Grade a list of answer indices against the question bank."""
        questions = QUESTIONS_BY_SKILL.get(skill_id, [])
        total = min(len(answers), len(questions))
        score = 0
        wrong_topics: list[str] = []

        for i in range(total):
            q = questions[i]
            if answers[i] == q.get("correct_answer"):
                score += 1
            else:
                wrong_topics.append(q.get("explanation", q.get("question", "")))

        percentage = round((score / total) * 100, 1) if total > 0 else 0
        passed = percentage >= 60

        # Persist result
        db_session.add(
            AssessmentResult(
                user_id=user_id,
                skill_id=skill_id,
                score=score,
                total=total,
                answers_json=json.dumps(answers),
                taken_at=datetime.utcnow(),
            )
        )

        # Log to agent_events
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="AssessmentAgent",
                event_type="assessment_graded",
                input_summary=f"user_id={user_id}, skill_id={skill_id}, {len(answers)} answers",
                output_summary=f"score={score}/{total} ({percentage}%), passed={passed}",
            )
        )
        db_session.commit()

        return {
            "score": score,
            "total": total,
            "percentage": percentage,
            "wrong_topics": wrong_topics,
            "passed": passed,
        }
