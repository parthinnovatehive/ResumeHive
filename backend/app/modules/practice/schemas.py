from datetime import datetime

from pydantic import BaseModel


class CompanyOut(BaseModel):
    id: int
    name: str
    slug: str


class QuestionOut(BaseModel):
    id: int
    title: str
    difficulty: str
    frequency: float
    acceptance_rate: float
    link: str
    status: str | None = None
    revisit_later: bool = False


class PaginatedQuestions(BaseModel):
    items: list[QuestionOut]
    total: int
    limit: int
    offset: int


class StatusUpdate(BaseModel):
    status: str


class RevisitUpdate(BaseModel):
    revisit_later: bool


class ProgressQuestionOut(BaseModel):
    id: int
    title: str
    link: str
    difficulty: str
    acceptance_rate: float
    status: str | None
    revisit_later: bool
    created_at: datetime
    updated_at: datetime


class PaginatedProgress(BaseModel):
    items: list[ProgressQuestionOut]
    total: int
    limit: int
    offset: int
