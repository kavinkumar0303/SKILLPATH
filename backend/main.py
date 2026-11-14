"""
SkillBridge AI - Enterprise Multi-Agent Backend
Main FastAPI Application Entrypoint
"""
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from db import init_db, get_session
from agents.orchestrator import OrchestratorAgent

# Import route modules
from routes.profile import router as profile_router
from routes.career import router as career_router
from routes.analysis import router as analysis_router
from routes.learning import router as learning_router
from routes.assessment import router as assessment_router
from routes.progress import router as progress_router
from routes.mentor import router as mentor_router
from routes.misc import router as misc_router
from routes.auth import router as auth_router
from routes.resume import router as resume_router

app = FastAPI(
    title="Skillpath - Learning API",
    description="Enterprise-grade AI learning intelligence platform powered by collaborative multi-agent architecture.",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://skillpath-blue-mu.vercel.app",
    ],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(career_router)
app.include_router(analysis_router)
app.include_router(learning_router)
app.include_router(assessment_router)
app.include_router(progress_router)
app.include_router(mentor_router)
app.include_router(misc_router)
app.include_router(resume_router)

@app.on_event("startup")
def on_startup():
    """Ensure database tables and demo seed user are ready on startup."""
    init_db()
    session = get_session()
    try:
        # Pre-generate learning path for Arjun Kumar (user_id=1)
        orchestrator = OrchestratorAgent()
        orchestrator.on_profile_updated(session, user_id=1)
    except Exception as e:
        print(f"[Skillpath Startup Notice] Seed initialization check: {e}")
    finally:
        session.close()

@app.get("/")
def root():
    return {
        "service": "Skillpath Core",
        "tagline": "Your path from skills to career",
        "status": "online",
        "agents": [
            "SkillAnalyzerAgent",
            "CareerMatchingAgent",
            "LearningPathAgent",
            "AssessmentAgent",
            "ProgressTrackerAgent",
            "MentorAgent",
            "OrchestratorAgent"
        ],
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

