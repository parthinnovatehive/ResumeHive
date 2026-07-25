from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.modules.auth.models import User
from app.modules.auth.schemas import SignupRequest, LoginRequest, AuthResponse, LinkedInProfileUpdate, LinkedInProfileResponse, UserProfileResponse, ProfileUpdateRequest


def signup(req: SignupRequest, db: Session) -> AuthResponse:
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        college_name=req.college_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user_id=user.id, email=user.email)


def login(req: LoginRequest, db: Session) -> AuthResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, user_id=user.id, email=user.email)


def get_user_profile(user_id: int, db: Session) -> LinkedInProfileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return LinkedInProfileResponse(
        linkedin_url=user.linkedin_url,
        linkedin_id=user.linkedin_id,
        headline=user.headline,
        about=user.about,
        top_skills=json.loads(user.top_skills) if user.top_skills else [],
        certifications=json.loads(user.certifications) if user.certifications else [],
        experience=json.loads(user.experience) if user.experience else [],
        education=json.loads(user.education) if user.education else [],
        linkedin_profile_stored=bool(user.linkedin_profile_stored),
    )


def get_full_user_profile(user_id: int, db: Session) -> UserProfileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        college_name=user.college_name or "",
        created_at=user.created_at.isoformat() if user.created_at else "",
        linkedin_url=user.linkedin_url,
        linkedin_id=user.linkedin_id,
        headline=user.headline,
        about=user.about,
        top_skills=json.loads(user.top_skills) if user.top_skills else [],
        certifications=json.loads(user.certifications) if user.certifications else [],
        experience=json.loads(user.experience) if user.experience else [],
        education=json.loads(user.education) if user.education else [],
        linkedin_profile_stored=bool(user.linkedin_profile_stored),
    )


def update_user_profile(user_id: int, req: ProfileUpdateRequest, db: Session) -> UserProfileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if req.college_name is not None:
        user.college_name = req.college_name
    if req.linkedin_url is not None:
        user.linkedin_url = req.linkedin_url
    if req.linkedin_id is not None:
        user.linkedin_id = req.linkedin_id
    if req.headline is not None:
        user.headline = req.headline
    if req.about is not None:
        user.about = req.about
    if req.top_skills is not None:
        user.top_skills = json.dumps(req.top_skills)
    if req.certifications is not None:
        user.certifications = json.dumps(req.certifications)
    if req.experience is not None:
        user.experience = json.dumps(req.experience)
    if req.education is not None:
        user.education = json.dumps(req.education)

    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        college_name=user.college_name or "",
        created_at=user.created_at.isoformat() if user.created_at else "",
        linkedin_url=user.linkedin_url,
        linkedin_id=user.linkedin_id,
        headline=user.headline,
        about=user.about,
        top_skills=json.loads(user.top_skills) if user.top_skills else [],
        certifications=json.loads(user.certifications) if user.certifications else [],
        experience=json.loads(user.experience) if user.experience else [],
        education=json.loads(user.education) if user.education else [],
        linkedin_profile_stored=bool(user.linkedin_profile_stored),
    )


def update_user_linkedin_profile(user_id: int, req: LinkedInProfileUpdate, db: Session) -> LinkedInProfileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if req.linkedin_url is not None:
        user.linkedin_url = req.linkedin_url
    if req.linkedin_id is not None:
        user.linkedin_id = req.linkedin_id
    if req.headline is not None:
        user.headline = req.headline
    if req.about is not None:
        user.about = req.about
    if req.top_skills is not None:
        user.top_skills = json.dumps(req.top_skills)
    if req.certifications is not None:
        user.certifications = json.dumps(req.certifications)
    if req.experience is not None:
        user.experience = json.dumps(req.experience)
    if req.education is not None:
        user.education = json.dumps(req.education)
    if req.store_profile is not None:
        user.linkedin_profile_stored = 1 if req.store_profile else 0

    db.commit()
    db.refresh(user)

    return LinkedInProfileResponse(
        linkedin_url=user.linkedin_url,
        linkedin_id=user.linkedin_id,
        headline=user.headline,
        about=user.about,
        top_skills=json.loads(user.top_skills) if user.top_skills else [],
        certifications=json.loads(user.certifications) if user.certifications else [],
        experience=json.loads(user.experience) if user.experience else [],
        education=json.loads(user.education) if user.education else [],
        linkedin_profile_stored=bool(user.linkedin_profile_stored),
    )
