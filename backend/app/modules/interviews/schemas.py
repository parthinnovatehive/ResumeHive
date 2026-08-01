from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class InterviewCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool

    model_config = {"from_attributes": True}


class InterviewSessionCreate(BaseModel):
    category_id: int


class InterviewSessionMessage(BaseModel):
    message: str


class InterviewTranscriptEntry(BaseModel):
    role: str
    message: str
    timestamp: str

class InterviewSessionFlagOut(BaseModel):
    id: int
    flag_type: str
    triggered_at: datetime

    model_config = {"from_attributes": True}
    
class InterviewSessionFlagCreate(BaseModel):
    flag_type: str
    timestamp: str


class InterviewSessionOut(BaseModel):
    id: int
    user_id: int
    category_id: int
    status: str
    transcript: List[InterviewTranscriptEntry]
    report: Optional[Dict[str, Any]]
    flags: List[InterviewSessionFlagOut] = []
    started_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}

class InterviewReportParameter(BaseModel):
    score: int
    feedback: str

class InterviewReportOut(BaseModel):
    overall_score: int
    summary: str
    parameters: Dict[str, InterviewReportParameter]
    strengths: List[str]
    areas_to_improve: List[str]
    suggested_focus_areas: List[str]

class ProgressAttempt(BaseModel):
    session_id: int
    date: str
    overall_score: int

class CategoryProgress(BaseModel):
    category_name: str
    category_slug: str
    attempts: List[ProgressAttempt]
