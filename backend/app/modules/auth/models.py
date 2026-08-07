from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    college_name = Column(String, default="")
    role = Column(String, default="student")
    created_at = Column(DateTime, server_default=func.now())

    subscription_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    college_license_id = Column(Integer, ForeignKey("college_licenses.id"), nullable=True)

    linkedin_url = Column(String, nullable=True)
    linkedin_id = Column(String, nullable=True)
    headline = Column(String, nullable=True)
    about = Column(Text, nullable=True)
    top_skills = Column(Text, default="[]")
    certifications = Column(Text, default="[]")
    experience = Column(Text, default="[]")
    education = Column(Text, default="[]")
    linkedin_profile_stored = Column(Integer, default=0)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    linkedin_analyses = relationship("LinkedinAnalysis", back_populates="user", cascade="all, delete-orphan")
    subscription_plan = relationship("SubscriptionPlan", back_populates="users")
    college_license = relationship("CollegeLicense", back_populates="users")

