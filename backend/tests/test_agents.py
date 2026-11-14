"""
SkillBridge AI - Multi-Agent & Adaptive System Tests
"""
import pytest
import os
import sys

# Ensure backend root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from db import init_db, get_session, User, UserSkill, CareerGoal, RoadmapItem, RevisionItem
from agents.skill_analyzer import SkillAnalyzerAgent
from agents.career_matching import CareerMatchingAgent
from agents.learning_path import LearningPathAgent
from agents.assessment import AssessmentAgent
from agents.progress_tracker import ProgressTrackerAgent
from agents.mentor import MentorAgent
from agents.orchestrator import OrchestratorAgent

@pytest.fixture(scope="module")
def db():
    init_db()
    session = get_session()
    yield session
    session.close()

def test_skill_analyzer_agent(db):
    agent = SkillAnalyzerAgent()
    result = agent.run(db, user_id=1)
    assert "skills" in result
    assert "strengths" in result
    assert "weaknesses" in result
    assert "radar_data" in result
    assert len(result["skills"]) >= 3

def test_career_matching_agent(db):
    agent = CareerMatchingAgent()
    result = agent.run(db, user_id=1, role_id="role_fullstack")
    assert "match_percentage" in result
    assert "matched_skills" in result
    assert "missing_skills" in result
    assert result["match_percentage"] > 0
    # Should identify JavaScript, React, Node.js as missing
    missing_ids = [s["skill_id"] for s in result["missing_skills"]]
    assert "skill_javascript" in missing_ids or "skill_react" in missing_ids

def test_learning_path_agent(db):
    agent = LearningPathAgent()
    result = agent.run(db, user_id=1, role_id="role_fullstack")
    assert "phases" in result
    assert len(result["phases"]) > 0
    phase_1 = result["phases"][0]
    assert len(phase_1["items"]) > 0

def test_assessment_agent_and_adaptive_remediation(db):
    assessment_agent = AssessmentAgent()
    questions = assessment_agent.get_questions("skill_javascript", count=8)
    assert len(questions) == 8
    
    orchestrator = OrchestratorAgent()
    # Submit all wrong answers -> score 0% (<60%)
    wrong_answers = [999] * 8
    result = orchestrator.on_assessment_submitted(db, user_id=1, skill_id="skill_javascript", answers=wrong_answers)
    assert result["grade"]["percentage"] < 60
    
    # Check that revision items were created
    revisions = db.query(RevisionItem).filter(
        RevisionItem.user_id == 1,
        RevisionItem.skill_id == "skill_javascript"
    ).all()
    assert len(revisions) > 0

def test_assessment_agent_mastery_acceleration(db):
    orchestrator = OrchestratorAgent()
    # Correct answers for skill_python
    # Find correct answers from questions
    from agents.assessment import QUESTIONS_BY_SKILL
    py_questions = QUESTIONS_BY_SKILL.get("skill_python", [])[:8]
    correct_answers = [q["correct_answer"] for q in py_questions]
    
    result = orchestrator.on_assessment_submitted(db, user_id=1, skill_id="skill_python", answers=correct_answers)
    assert result["grade"]["percentage"] >= 85
    
    # Skill level should be updated to at least 85
    us = db.query(UserSkill).filter(UserSkill.user_id == 1, UserSkill.skill_id == "skill_python").first()
    assert us.level >= 85

def test_goal_change_regenerates_roadmap(db):
    orchestrator = OrchestratorAgent()
    initial_items = db.query(RoadmapItem).filter(RoadmapItem.user_id == 1).all()
    
    # Change goal to data scientist
    result = orchestrator.on_goal_changed(db, user_id=1, role_id="role_data_scientist")
    assert "match" in result
    assert "roadmap" in result
    
    new_items = db.query(RoadmapItem).filter(RoadmapItem.user_id == 1).all()
    new_skills = {item.skill_id for item in new_items}
    # Data scientist roadmap should contain data science skills like pandas or statistics
    assert "skill_pandas" in new_skills or "skill_statistics" in new_skills or "skill_data_analysis" in new_skills
    
    # Revert goal back to fullstack for consistent demo state
    orchestrator.on_goal_changed(db, user_id=1, role_id="role_fullstack")

def test_simulator_does_not_mutate_state(db):
    goal_before = db.query(CareerGoal).filter(CareerGoal.user_id == 1, CareerGoal.active == True).first().role_id
    roadmap_count_before = db.query(RoadmapItem).filter(RoadmapItem.user_id == 1).count()
    
    from routes.career import simulate_career_goal, SimulateRequest
    sim = simulate_career_goal(SimulateRequest(role_id="role_devops"), user_id=1)
    
    goal_after = db.query(CareerGoal).filter(CareerGoal.user_id == 1, CareerGoal.active == True).first().role_id
    roadmap_count_after = db.query(RoadmapItem).filter(RoadmapItem.user_id == 1).count()
    
    assert goal_before == goal_after
    assert roadmap_count_before == roadmap_count_after
    assert "simulated_match" in sim

def test_resume_agent_no_invented_data(db):
    from agents.resume_agent import ResumeAgent
    agent = ResumeAgent()
    resume = agent.assemble(db, user_id=1, role_id="role_fullstack", force_regenerate=True)
    
    assert "header" in resume
    assert resume["header"]["name"] == "Arjun Kumar"
    assert "skills" in resume
    assert "ats_match" in resume
    assert "completeness" in resume
    
    # Skills in resume must come strictly from user's UserSkill records
    user_skill_ids = {s.skill_id for s in db.query(UserSkill).filter(UserSkill.user_id == 1).all()}
    resume_skill_ids = {
        s["skill_id"]
        for cat in resume["skills"]
        for s in cat.get("skills", [])
    }
    assert resume_skill_ids.issubset(user_skill_ids)

def test_resume_agent_dedupe_skills(db):
    from agents.resume_agent import ResumeAgent
    agent = ResumeAgent()
    resume = agent.assemble(db, user_id=1, role_id="role_fullstack", force_regenerate=True)
    
    seen = []
    for cat in resume["skills"]:
        for s in cat.get("skills", []):
            seen.append(s["skill_id"])
    assert len(seen) == len(set(seen)), "Each skill must appear exactly once in the resume."

def test_resume_agent_data_change_detection(db):
    from agents.resume_agent import ResumeAgent
    agent = ResumeAgent()
    r1 = agent.assemble(db, user_id=1, role_id="role_fullstack", force_regenerate=True)
    fp1 = r1["data_fingerprint"]
    
    user = db.query(User).filter(User.id == 1).first()
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == 1).all()
    from db import AssessmentResult
    assessments = db.query(AssessmentResult).filter(AssessmentResult.user_id == 1).all()
    
    # Modify location
    old_loc = user.location
    user.location = "Hyderabad, India"
    db.commit()
    
    fp2 = agent.compute_data_fingerprint(user, user_skills, assessments, "role_fullstack")
    assert fp1 != fp2, "Data fingerprint must change when student profile data updates."
    
    # Revert
    user.location = old_loc
    db.commit()

def test_resume_orchestrator_event(db):
    from db import AgentEvent
    orchestrator = OrchestratorAgent()
    count_before = db.query(AgentEvent).filter(AgentEvent.agent_name == "ResumeAgent").count()
    
    res = orchestrator.on_resume_requested(db, user_id=1, role_id="role_fullstack", force_regenerate=True)
    assert "resume" in res
    assert "mentor_tip" in res
    
    count_after = db.query(AgentEvent).filter(AgentEvent.agent_name == "ResumeAgent").count()
    assert count_after > count_before


def test_resume_limited_data_grounded_output(db):
    """
    Assert that when a user has limited data (only name, email, 2 skills),
    every single token in the generated resume originates from source data without invention.
    """
    import uuid
    from agents.resume_agent import ResumeAgent

    unique_email = f"riya_{uuid.uuid4().hex[:6]}@example.com"
    # Create temporary user with only name, email and 2 skills
    limited_user = User(
        name="Riya Sharma",
        email=unique_email,
        phone=None,
        location=None,
        linkedin=None,
        github=None,
        education=None,
        projects=None,
    )
    db.add(limited_user)
    db.commit()

    # Add exactly 2 skills: Python and SQL
    db.add(UserSkill(user_id=limited_user.id, skill_id="skill_python", level=70))
    db.add(UserSkill(user_id=limited_user.id, skill_id="skill_sql", level=65))
    db.commit()

    agent = ResumeAgent()
    resume = agent.assemble(db, user_id=limited_user.id, role_id="role_fullstack", force_regenerate=True)

    # Header asserts
    assert resume["header"]["name"] == "Riya Sharma"
    assert resume["header"]["email"] == unique_email
    assert resume["header"]["phone"] == ""
    assert resume["header"]["location"] == ""
    assert resume["header"]["linkedin"] == ""
    assert resume["header"]["github"] == ""

    # Empty sections must be empty lists
    assert resume["education"] == []
    assert resume["projects"] == []
    assert resume["certifications"] == []

    # Skills must contain only Python and SQL
    res_skills = [s["name"] for cat in resume["skills"] for s in cat["skills"]]
    assert set(res_skills) == {"Python", "SQL"}

    # Summary must be strictly grounded: "Student with skills in Python, SQL, aiming for a Full Stack Developer role."
    assert "Python" in resume["summary"]
    assert "SQL" in resume["summary"]
    assert "Full Stack Developer" in resume["summary"]

    # Source vocabulary set
    source_vocab = {
        "riya", "sharma", unique_email, "python", "sql", "full", "stack", "developer",
        "student", "with", "skills", "in", "aiming", "for", "a", "role", "role."
    }

    # Verify summary words exist in source vocab
    for word in resume["summary"].lower().replace(",", "").replace(".", "").split():
        assert word in source_vocab, f"Invented word found in summary: {word}"

    # Cleanup
    db.delete(limited_user)
    db.commit()



