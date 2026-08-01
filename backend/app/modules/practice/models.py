from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.types import Enum as SA_Enum

from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    link = Column(String, unique=True, nullable=False, index=True)
    difficulty = Column(String, nullable=False)
    acceptance_rate = Column(Float, default=0.0)


class CompanyQuestionStat(Base):
    __tablename__ = "company_question_stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    time_window = Column(String, nullable=False)
    frequency = Column(Float, default=0.0)

    __table_args__ = (
        UniqueConstraint(
            "company_id", "question_id", "time_window",
            name="uq_company_question_time_window"
        ),
        Index("ix_cqs_company_time_window", "company_id", "time_window"),
    )


class QuestionProgress(Base):
    __tablename__ = "question_progress"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=True)
    revisit_later = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_user_question"),
        Index("ix_qp_user_status", "user_id", "status"),
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=False)


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    description_html = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    constraints = Column(String, nullable=True)
    
    test_cases_json = Column(String, nullable=False)
    
    js_stub = Column(String, nullable=True)
    python_stub = Column(String, nullable=True)
    java_stub = Column(String, nullable=True)
    cpp_stub = Column(String, nullable=True)
    c_stub = Column(String, nullable=True)
