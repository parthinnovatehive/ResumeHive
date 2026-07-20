from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.schemas import SignupRequest, LoginRequest, AuthResponse
from app.modules.auth import service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
def signup_endpoint(req: SignupRequest, db: Session = Depends(get_db)):
    return service.signup(req, db)


@router.post("/login", response_model=AuthResponse)
def login_endpoint(req: LoginRequest, db: Session = Depends(get_db)):
    return service.login(req, db)
