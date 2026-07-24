from pydantic import BaseModel, EmailStr
from typing import Optional
from typing import List, Optional as Opt
import json


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    college_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user_id: int
    email: str


class LinkedInProfileUpdate(BaseModel):
    linkedin_url: Opt[str] = None
    linkedin_id: Opt[str] = None
    headline: Opt[str] = None
    about: Opt[str] = None
    top_skills: Opt[List[str]] = None
    certifications: Opt[List[str]] = None
    experience: Opt[List[dict]] = None
    education: Opt[List[dict]] = None
    store_profile: bool = False


class LinkedInProfileResponse(BaseModel):
    linkedin_url: Opt[str] = None
    linkedin_id: Opt[str] = None
    headline: Opt[str] = None
    about: Opt[str] = None
    top_skills: List[str] = []
    certifications: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    linkedin_profile_stored: bool = False

    class Config:
        from_attributes = True
