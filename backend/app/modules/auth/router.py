from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.modules.auth.schemas import SignupRequest, LoginRequest, AuthResponse, LinkedInProfileUpdate, LinkedInProfileResponse
from app.modules.auth import service
from app.modules.auth.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup_endpoint(req: SignupRequest, db: Session = Depends(get_db)):
    return service.signup(req, db)


@router.post("/login", response_model=AuthResponse)
def login_endpoint(req: LoginRequest, db: Session = Depends(get_db)):
    return service.login(req, db)


@router.get("/me/linkedin", response_model=LinkedInProfileResponse)
def get_linkedin_profile(
    current_user: User = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.get_user_profile(current_user, db)


@router.put("/me/linkedin", response_model=LinkedInProfileResponse)
def update_linkedin_profile(
    req: LinkedInProfileUpdate,
    current_user: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return service.update_user_linkedin_profile(current_user, req, db)
