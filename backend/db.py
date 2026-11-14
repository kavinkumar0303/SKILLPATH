"""
SkillBridge AI – Database layer (SQLite + SQLAlchemy, synchronous).
"""

import os
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    DB_PATH = "/tmp/skillbridge.db"
else:
    BASE_DIR = os.path.dirname(__file__)
    DB_PATH = os.path.join(BASE_DIR, "skillbridge.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

Base = declarative_base()

# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    bio = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    github = Column(String, nullable=True)
    education = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    resume_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    career_goals = relationship("CareerGoal", back_populates="user", cascade="all, delete-orphan")
    roadmap_items = relationship("RoadmapItem", back_populates="user", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="user", cascade="all, delete-orphan")
    revision_items = relationship("RevisionItem", back_populates="user", cascade="all, delete-orphan")
    planner_items = relationship("PlannerItem", back_populates="user", cascade="all, delete-orphan")
    mentor_messages = relationship("MentorMessage", back_populates="user", cascade="all, delete-orphan")
    resume_versions = relationship("ResumeVersion", back_populates="user", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, nullable=False)
    level = Column(Integer, default=0)  # 0-100

    user = relationship("User", back_populates="skills")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, nullable=False)
    selected_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

    user = relationship("User", back_populates="career_goals")


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    type = Column(String, nullable=False)
    url = Column(String, nullable=False)
    duration_hours = Column(Float, default=0.0)
    difficulty = Column(String, default="beginner")
    phase = Column(Integer, default=1)
    order = Column(Integer, default=0)
    status = Column(String, default="pending")
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="roadmap_items")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    total = Column(Integer, nullable=False)
    answers_json = Column(Text, nullable=True)
    taken_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessment_results")


class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    input_summary = Column(String, nullable=True)
    output_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RevisionItem(Base):
    __tablename__ = "revision_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String, nullable=False)
    question_id = Column(String, nullable=False)
    next_review = Column(DateTime, default=datetime.utcnow)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)

    user = relationship("User", back_populates="revision_items")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    skills_used = Column(Text, nullable=True)  # JSON string
    difficulty = Column(String, default="beginner")
    estimated_hours = Column(Integer, default=0)


class PlannerItem(Base):
    __tablename__ = "planner_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0-6
    skill_id = Column(String, nullable=False)
    activity = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=30)

    user = relationship("User", back_populates="planner_items")


class MentorMessage(Base):
    __tablename__ = "mentor_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)  # "user" | "mentor"
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mentor_messages")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, nullable=False)
    role_name = Column(String, nullable=False)
    template = Column(String, default="modern")
    version_name = Column(String, nullable=False)
    resume_json = Column(Text, nullable=False)
    ats_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resume_versions")


# ---------------------------------------------------------------------------
# Engine / Session helpers
# ---------------------------------------------------------------------------

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(DATABASE_URL, echo=False)
    return _engine


def get_session() -> Session:
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def init_db():
    """Create all tables and seed the demo user if the DB is empty."""
    engine = get_engine()
    Base.metadata.create_all(engine)
    # Safe SQLite column migration for new profile/resume fields
    with engine.connect() as conn:
        from sqlalchemy import text
        for col, col_type in [
            ("avatar", "VARCHAR"),
            ("phone", "VARCHAR"),
            ("location", "VARCHAR"),
            ("linkedin", "VARCHAR"),
            ("github", "VARCHAR"),
            ("education", "TEXT"),
            ("projects", "TEXT"),
            ("resume_data", "TEXT"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass
    session = get_session()
    try:
        if session.query(User).count() == 0:
            seed_demo_user(session)
    finally:
        session.close()


def seed_demo_user(session: Session | None = None):
    """Insert the demo user 'Arjun Kumar' with starter skills and a career goal."""
    close_after = False
    if session is None:
        session = get_session()
        close_after = True

    try:
        # Check if demo user already exists
        existing = session.query(User).filter_by(email="arjun@example.com").first()
        if existing:
            if not existing.phone:
                existing.phone = "+91 98765 43210"
                existing.location = "Bangalore, India"
                existing.linkedin = "linkedin.com/in/arjun-kumar-dev"
                existing.github = "github.com/arjun-kumar"
                existing.avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                existing.education = '[{"degree": "B.Tech in Computer Science & Engineering", "institution": "Indian Institute of Information Technology", "period": "2023 - 2027", "score": "8.6 CGPA", "current": true}]'
                existing.projects = '[{"id": "proj-1", "title": "Database Query Engine", "organization": "Academic Project", "period": "2026", "description": "Built relational schemas and optimized queries using SQL and Python.", "skills": ["Python", "SQL"]}]'
                session.commit()
            elif not existing.projects:
                existing.projects = '[{"id": "proj-1", "title": "Database Query Engine", "organization": "Academic Project", "period": "2026", "description": "Built relational schemas and optimized queries using SQL and Python.", "skills": ["Python", "SQL"]}]'
                session.commit()
            return existing

        user = User(
            name="Arjun Kumar",
            email="arjun@example.com",
            phone="+91 98765 43210",
            location="Bangalore, India",
            linkedin="linkedin.com/in/arjun-kumar-dev",
            github="github.com/arjun-kumar",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            education='[{"degree": "B.Tech in Computer Science & Engineering", "institution": "Indian Institute of Information Technology", "period": "2023 - 2027", "score": "8.6 CGPA", "current": true}]',
            projects='[{"id": "proj-1", "title": "Database Query Engine", "organization": "Academic Project", "period": "2026", "description": "Built relational schemas and optimized queries using SQL and Python.", "skills": ["Python", "SQL"]}]',
            bio="B.Tech Computer Science student passionate about full-stack development. "
                "Currently learning web technologies and aiming to become a proficient "
                "full-stack developer.",
        )
        session.add(user)
        session.flush()  # populate user.id

        # Starter skills
        for skill_id, level in [("skill_python", 70), ("skill_sql", 60), ("skill_html", 55)]:
            session.add(UserSkill(user_id=user.id, skill_id=skill_id, level=level))

        # Career goal
        session.add(
            CareerGoal(
                user_id=user.id,
                role_id="role_fullstack",
                active=True,
            )
        )

        session.commit()
        return user
    except Exception:
        session.rollback()
        raise
    finally:
        if close_after:
            session.close()


# ---------------------------------------------------------------------------
# Convenience: run this file directly to initialise the DB
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    print(f"Database initialised at {DB_PATH}")
