"""
Skillpath - Authentication, Google Identity Services & JWT Sessions
"""
import os
import datetime
import jwt
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from db import get_session, User

JWT_SECRET = os.environ.get("JWT_SECRET", "skillpath-super-secret-jwt-key-2026-production")
JWT_ALGORITHM = "HS256"
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() in ("true", "1", "yes")

security_bearer = HTTPBearer(auto_error=False)

def create_session_token(user_id: int, email: str, name: str) -> str:
    """Create a 7-day signed JWT session token."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "name": name,
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_session_token(token: str) -> dict | None:
    """Decode and validate a session token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def verify_google_credential(credential: str) -> dict:
    """
    Verify Google ID token.
    Returns dictionary with email, name, picture, email_verified, etc.
    """
    # Demo mock token support for local development and test suite
    if credential.startswith("demo_token_") or (not GOOGLE_CLIENT_ID and credential == "demo"):
        return {
            "email": "arjun.kumar@skillpath.edu",
            "name": "Arjun Kumar",
            "picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "email_verified": True,
            "sub": "demo-arjun-12345",
        }
    
    # In live Google Identity Services mode, verify with google-auth library
    try:
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
        )
        if not id_info.get("email_verified"):
            raise ValueError("Google account email is not verified.")
        return id_info
    except Exception as e:
        # If client ID is not configured on server, parse unverified JWT payload for local testing
        if not GOOGLE_CLIENT_ID:
            try:
                unverified = jwt.decode(credential, options={"verify_signature": False})
                return {
                    "email": unverified.get("email"),
                    "name": unverified.get("name", unverified.get("email", "").split("@")[0]),
                    "picture": unverified.get("picture", ""),
                    "email_verified": True,
                    "sub": unverified.get("sub", "google-sub"),
                }
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not verify Google ID token: {str(e)}"
        )

def get_db():
    session = get_session()
    try:
        yield session
    finally:
        session.close()

def get_current_user(
    request: Request,
    bearer: HTTPAuthorizationCredentials | None = Depends(security_bearer),
    session: Session = Depends(get_db),
) -> User:
    """
    Reads the user from httpOnly session cookie or Bearer token.
    Raises 401 if unauthenticated.
    """
    token = request.cookies.get("session_token")
    if not token and bearer:
        token = bearer.credentials
        
    if not token:
        # In demo fallback mode, if request asks for demo user fallback
        if DEMO_MODE:
            demo_user = session.query(User).filter(User.id == 1).first()
            if demo_user:
                return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session missing or expired. Please sign in."
        )
        
    payload = decode_session_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token. Please sign in again."
        )
        
    user_id = int(payload["sub"])
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found."
        )
    return user

