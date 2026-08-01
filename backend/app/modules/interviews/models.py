from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean, JSON, func
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class InterviewCategory(Base):
    __tablename__ = "interview_categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    system_prompt_template = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("interview_categories.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String, default="in_progress") # in_progress, completed
    transcript = Column(JSON, default=list)
    report = Column(JSON, nullable=True)
    
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, nullable=True)

    category = relationship("InterviewCategory")
    flags = relationship("InterviewSessionFlag", back_populates="session", cascade="all, delete-orphan")


class InterviewSessionFlag(Base):
    __tablename__ = "interview_session_flags"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    flag_type = Column(String(50)) # e.g. NO_FACE_DETECTED, LOOKING_AWAY
    triggered_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("InterviewSession", back_populates="flags")
