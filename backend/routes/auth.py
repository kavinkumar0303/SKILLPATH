"""
Skillpath - Authentication Routes (Google Sign-In, Session & User State)
"""
import os
import json
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import get_session, User, CareerGoal, UserSkill
from auth import (
    create_session_token,
    verify_google_credential,
    get_current_user,
    get_db,
    GOOGLE_CLIENT_ID,
    DEMO_MODE,
)
from agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
orchestrator = OrchestratorAgent()

class GoogleAuthRequest(BaseModel):
    credential: str

@router.get("/config")
def get_auth_config():
    """Returns whether Google Sign-In is configured on the backend."""
    return {
        "google_client_id": GOOGLE_CLIENT_ID,
        "configured": bool(GOOGLE_CLIENT_ID),
        "demo_mode": DEMO_MODE,
    }

@router.post("/google")
def sign_in_with_google(
    payload: GoogleAuthRequest,
    response: Response,
    session: Session = Depends(get_db),
):
    """
    Verifies Google ID token from GIS account selection.
    Creates user if first login and issues signed 7-day httpOnly session cookie.
    """
    id_info = verify_google_credential(payload.credential)
    email = id_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account must include an email address."
        )

    name = id_info.get("name", email.split("@")[0].title())
    avatar = id_info.get("picture", "")

    user = session.query(User).filter(User.email == email).first()
    is_new = False

    if not user:
        is_new = True
        user = User(
            name=name,
            email=email,
            avatar=avatar,
            bio="Student aiming to grow skills and achieve target career milestones on Skillpath.",
            phone="",
            location="",
            linkedin="",
            github="",
            education='[{"degree": "Bachelor of Technology / Science", "institution": "University / College", "period": "2023 - 2027", "score": "In Progress", "current": true}]',
        )
        session.add(user)
        session.flush()

        # Seed initial starter role goal
        session.add(
            CareerGoal(
                user_id=user.id,
                role_id="role_fullstack",
                active=True
            )
        )
        # Seed default foundational skill
        session.add(
            UserSkill(
                user_id=user.id,
                skill_id="skill_html",
                level=40
            )
        )
        session.commit()

        # Generate initial learning roadmap through orchestrator
        try:
            orchestrator.on_profile_updated(session, user_id=user.id)
        except Exception as e:
            print(f"[Orchestrator Notice] Initial onboarding roadmap setup: {e}")
    else:
        # Update avatar if missing
        if avatar and not user.avatar:
            user.avatar = avatar
            session.commit()

    token = create_session_token(user.id, user.email, user.name)
    response.set_cookie(
        key="session_token",
        value=token,
        max_age=7 * 24 * 3600,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
            "is_new": is_new,
        },
        "token": token,
    }

@router.post("/demo")
def sign_in_as_demo(
    response: Response,
    session: Session = Depends(get_db),
):
    """Sign in as demo student Arjun Kumar (user_id=1)."""
    user = session.query(User).filter(User.id == 1).first()
    if not user:
        from db import seed_demo_user
        user = seed_demo_user(session)

    token = create_session_token(user.id, user.email, user.name)
    response.set_cookie(
        key="session_token",
        value=token,
        max_age=7 * 24 * 3600,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
            "is_new": False,
        },
        "token": token,
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Returns the authenticated user from the active session."""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar,
        "bio": user.bio,
        "phone": user.phone or "",
        "location": user.location or "",
        "linkedin": user.linkedin or "",
        "github": user.github or "",
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

@router.post("/logout")
def logout(response: Response):
    """Clears the session cookie and terminates authentication."""
    response.delete_cookie(key="session_token", path="/")
    return {"status": "logged_out"}

