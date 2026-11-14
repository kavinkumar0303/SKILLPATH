"""
SkillBridge AI – Orchestrator Agent.
Coordinates multi-agent workflows triggered by user actions.
"""

import json
import os
import re
from datetime import datetime, timedelta

from db import (
    AgentEvent,
    CareerGoal,
    RevisionItem,
    RoadmapItem,
    UserSkill,
)

from .skill_analyzer import SkillAnalyzerAgent
from .career_matching import CareerMatchingAgent
from .learning_path import LearningPathAgent
from .assessment import AssessmentAgent
from .progress_tracker import ProgressTrackerAgent
from .mentor import MentorAgent
from .resume_agent import ResumeAgent

# Load seed data (for skill name lookups in resume parsing)
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


class OrchestratorAgent:
    """Coordinates agent pipelines for major user actions."""

    def __init__(self):
        self.skill_analyzer = SkillAnalyzerAgent()
        self.career_matching = CareerMatchingAgent()
        self.learning_path = LearningPathAgent()
        self.assessment = AssessmentAgent()
        self.progress_tracker = ProgressTrackerAgent()
        self.mentor = MentorAgent()
        self.resume_agent = ResumeAgent()

    # ------------------------------------------------------------------
    # PROFILE_UPDATED: SkillAnalyzer -> CareerMatching -> LearningPath
    # ------------------------------------------------------------------
    def on_profile_updated(self, db_session, user_id: int) -> dict:
        analysis = self.skill_analyzer.run(db_session, user_id)

        # Find active career goal
        goal = (
            db_session.query(CareerGoal)
            .filter(CareerGoal.user_id == user_id, CareerGoal.active == True)
            .first()
        )

        match_result = None
        roadmap = None
        if goal:
            match_result = self.career_matching.run(db_session, user_id, goal.role_id)
            roadmap = self.learning_path.run(db_session, user_id, goal.role_id)

        self._log(db_session, user_id, "on_profile_updated",
                  f"user_id={user_id}",
                  f"analysis done, match={'yes' if match_result else 'no'}")

        return {
            "analysis": analysis,
            "match": match_result,
            "roadmap": roadmap,
        }

    # ------------------------------------------------------------------
    # GOAL_CHANGED: CareerMatching -> LearningPath -> Progress -> Mentor
    # ------------------------------------------------------------------
    def on_goal_changed(self, db_session, user_id: int, role_id: str) -> dict:
        match_result = self.career_matching.run(db_session, user_id, role_id)
        roadmap = self.learning_path.run(db_session, user_id, role_id)
        progress = self.progress_tracker.run(db_session, user_id)
        mentor_result = self.mentor.run(
            db_session, user_id,
            f"I just updated my career goal to {role_id}. My match is {match_result['match_percentage']}%."
        )

        self._log(db_session, user_id, "on_goal_changed",
                  f"user_id={user_id}, role_id={role_id}",
                  f"match={match_result['match_percentage']}%")

        return {
            "match": match_result,
            "roadmap": roadmap,
            "progress": progress,
            "mentor": mentor_result,
        }

    # ------------------------------------------------------------------
    # ASSESSMENT_SUBMITTED: Grade -> SkillAnalyzer -> Progress ->
    #                       LearningPath adapt -> Mentor
    # ------------------------------------------------------------------
    def on_assessment_submitted(
        self,
        db_session,
        user_id: int,
        skill_id: str,
        answers: list[int],
    ) -> dict:
        grade_result = self.assessment.grade(db_session, user_id, skill_id, answers)
        analysis = self.skill_analyzer.run(db_session, user_id)
        progress = self.progress_tracker.run(db_session, user_id)

        # Adapt learning path based on score
        goal = (
            db_session.query(CareerGoal)
            .filter(CareerGoal.user_id == user_id, CareerGoal.active == True)
            .first()
        )
        roadmap = None
        if goal:
            roadmap = self.learning_path.run(db_session, user_id, goal.role_id)

        # Score-based adaptations
        percentage = grade_result["percentage"]
        if percentage < 60:
            # Add revision items for wrong questions
            questions_data = self.assessment.get_questions(skill_id)
            for i, ans in enumerate(answers):
                if i < len(questions_data):
                    q = questions_data[i]
                    # Check if answer is wrong (we don't have correct_answer in
                    # stripped questions, so use wrong_topics as proxy)
                    if i < len(grade_result.get("wrong_topics", [])):
                        existing = (
                            db_session.query(RevisionItem)
                            .filter(
                                RevisionItem.user_id == user_id,
                                RevisionItem.skill_id == skill_id,
                                RevisionItem.question_id == q["id"],
                            )
                            .first()
                        )
                        if not existing:
                            db_session.add(
                                RevisionItem(
                                    user_id=user_id,
                                    skill_id=skill_id,
                                    question_id=q["id"],
                                    next_review=datetime.utcnow() + timedelta(days=1),
                                    interval_days=1,
                                    ease_factor=2.5,
                                )
                            )
            db_session.commit()

        if percentage >= 85:
            # Mark skill as mastered – update user_skill level
            user_skill = (
                db_session.query(UserSkill)
                .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id)
                .first()
            )
            if user_skill and user_skill.level < 85:
                user_skill.level = 85
                db_session.commit()
            # Mark related roadmap items as completed
            pending_items = (
                db_session.query(RoadmapItem)
                .filter(
                    RoadmapItem.user_id == user_id,
                    RoadmapItem.skill_id == skill_id,
                    RoadmapItem.status == "pending",
                )
                .all()
            )
            for item in pending_items:
                item.status = "completed"
                item.completed_at = datetime.utcnow()
            db_session.commit()

        # Mentor feedback
        if percentage >= 85:
            mentor_msg = f"I scored {percentage}% on {skill_id}! I mastered it!"
        elif percentage >= 60:
            mentor_msg = f"I scored {percentage}% on {skill_id}. Not bad!"
        else:
            mentor_msg = f"I scored {percentage}% on {skill_id}. I'm struggling."

        mentor_result = self.mentor.run(db_session, user_id, mentor_msg)

        self._log(db_session, user_id, "on_assessment_submitted",
                  f"user_id={user_id}, skill_id={skill_id}",
                  f"score={grade_result['score']}/{grade_result['total']}")

        return {
            "grade": grade_result,
            "analysis": analysis,
            "progress": progress,
            "roadmap": roadmap,
            "mentor": mentor_result,
        }

    # ------------------------------------------------------------------
    # MENTOR_QUERY
    # ------------------------------------------------------------------
    def on_mentor_query(self, db_session, user_id: int, message: str) -> dict:
        result = self.mentor.run(db_session, user_id, message)

        self._log(db_session, user_id, "on_mentor_query",
                  f"user_id={user_id}, msg_len={len(message)}",
                  f"response_len={len(result['response'])}")

        return result

    # ------------------------------------------------------------------
    # RESUME_UPLOADED: parse skills -> add to user_skills ->
    #                  CareerMatching -> LearningPath
    # ------------------------------------------------------------------
    def on_resume_uploaded(self, db_session, user_id: int, text: str) -> dict:
        extracted_skills = self._extract_skills_from_text(text)

        # Add or update user skills
        for skill_id, estimated_level in extracted_skills:
            existing = (
                db_session.query(UserSkill)
                .filter(
                    UserSkill.user_id == user_id,
                    UserSkill.skill_id == skill_id,
                )
                .first()
            )
            if existing:
                # Keep the higher level
                if estimated_level > existing.level:
                    existing.level = estimated_level
            else:
                db_session.add(
                    UserSkill(
                        user_id=user_id,
                        skill_id=skill_id,
                        level=estimated_level,
                    )
                )
        db_session.commit()

        # Run career matching and learning path if goal exists
        goal = (
            db_session.query(CareerGoal)
            .filter(CareerGoal.user_id == user_id, CareerGoal.active == True)
            .first()
        )

        match_result = None
        roadmap = None
        if goal:
            match_result = self.career_matching.run(db_session, user_id, goal.role_id)
            roadmap = self.learning_path.run(db_session, user_id, goal.role_id)

        self._log(db_session, user_id, "on_resume_uploaded",
                  f"user_id={user_id}, text_len={len(text)}",
                  f"extracted {len(extracted_skills)} skills")

        return {
            "extracted_skills": [
                {"skill_id": sid, "estimated_level": lvl}
                for sid, lvl in extracted_skills
            ],
            "match": match_result,
            "roadmap": roadmap,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _extract_skills_from_text(self, text: str) -> list[tuple[str, int]]:
        """Simple keyword-based skill extraction from resume text."""
        text_lower = text.lower()
        results: list[tuple[str, int]] = []

        for skill in SKILLS:
            skill_name = skill["name"].lower()
            skill_id = skill["id"]

            # Check if skill name appears in text
            if re.search(r'\b' + re.escape(skill_name) + r'\b', text_lower):
                # Estimate level based on context clues
                level = 50  # default moderate
                # Look for experience indicators
                for strong_kw in ("expert", "advanced", "proficient", "5+ years", "senior"):
                    if strong_kw in text_lower:
                        level = 75
                        break
                for beginner_kw in ("beginner", "basic", "learning", "familiar"):
                    if beginner_kw in text_lower:
                        level = 35
                        break
                results.append((skill_id, level))

        return results

    # ------------------------------------------------------------------
    # RESUME_REQUESTED: ResumeAgent -> SkillAnalyzer -> CareerMatching -> ResumeAgent assembles -> Mentor tip
    # ------------------------------------------------------------------
    def on_resume_requested(self, db_session, user_id: int, role_id: str = None, template: str = "modern", force_regenerate: bool = False) -> dict:
        # Step 1: SkillAnalyzer verifies skills
        analysis = self.skill_analyzer.run(db_session, user_id)
        
        # Step 2: CareerMatching evaluates target role keywords
        if not role_id:
            goal = db_session.query(CareerGoal).filter(CareerGoal.user_id == user_id, CareerGoal.active == True).first()
            role_id = goal.role_id if goal else "role_fullstack"
        matching = self.career_matching.run(db_session, user_id, role_id)
        
        # Step 3: ResumeAgent assembles structured ATS resume
        resume_data = self.resume_agent.assemble(db_session, user_id, role_id, template, force_regenerate)
        
        # Step 4: Mentor short pedagogical tip
        tip_msg = f"Your resume currently matches {resume_data['ats_match']['score']}% of required skills for {resume_data['target_role_name']}. Focus on next roadmap modules to unlock more verified skills!"
        try:
            self.mentor.run(db_session, user_id, tip_msg)
        except Exception:
            pass
        
        # Step 5: Log orchestration event
        self._log(
            db_session, user_id, "resume_pipeline",
            f"role_id={role_id}, template={template}",
            f"ATS Score={resume_data['ats_match']['score']}%, Completeness={resume_data['completeness']}%, Mentor tip dispatched."
        )
        
        return {
            "resume": resume_data,
            "mentor_tip": tip_msg,
            "ats_match": resume_data["ats_match"],
        }

    def _log(self, db_session, user_id, event_type, input_summary, output_summary):
        db_session.add(
            AgentEvent(
                user_id=user_id,
                agent_name="OrchestratorAgent",
                event_type=event_type,
                input_summary=input_summary,
                output_summary=output_summary,
            )
        )
        db_session.commit()
