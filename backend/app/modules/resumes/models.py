from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Resume(Base):
    """Resume document belonging to a single user.

    Complex nested data (education, experience, projects, skills,
    certifications, section_order) is stored as JSON-encoded TEXT columns
    and deserialised in the service layer.
    """

    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name = Column(String, default="")
    email = Column(String, default="")
    phone = Column(String, default="")
    location = Column(String, default="")
    linkedin_url = Column(String, default="")
    summary = Column(Text, default="")
    education = Column(Text, default="[]")
    experience = Column(Text, default="[]")
    projects = Column(Text, default="[]")
    skills = Column(Text, default="[]")
    certifications = Column(Text, default="[]")
    section_order = Column(
        Text,
        default='["summary","experience","education","projects","skills","certifications"]',
    )
    ats_score = Column(Integer, nullable=True)
    # Job description this resume is tailored to (Phase 4 duplicate-and-tailor).
    # NULL for the master resume; set when a tailored copy is created or a JD
    # is matched in the builder, so the student can re-check the same job later.
    jd_text = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="resumes")
