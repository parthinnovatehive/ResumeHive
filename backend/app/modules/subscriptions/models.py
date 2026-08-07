from sqlalchemy import Column, DateTime, Integer, String, Float, Boolean, Text, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    plan_type = Column(String, default="individual") # "individual" or "college"
    price_monthly = Column(Float, default=0.0)
    price_yearly = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    badge_tag = Column(String, default="") # e.g. "Popular", "Campus Prime", "Best Value"
    discount_percentage = Column(Float, default=0.0)
    trial_period_days = Column(Integer, default=0)
    max_resumes = Column(Integer, default=1) # -1 = unlimited
    max_mock_interviews_per_month = Column(Integer, default=2) # -1 = unlimited
    max_ats_scans_per_month = Column(Integer, default=3) # -1 = unlimited
    allow_custom_questions = Column(Boolean, default=False)
    allow_advanced_analytics = Column(Boolean, default=False)
    allow_proctoring_reports = Column(Boolean, default=False)
    support_level = Column(String, default="Community")
    is_popular = Column(Boolean, default=False)
    features_json = Column(Text, default="[]")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    users = relationship("User", back_populates="subscription_plan")
    college_licenses = relationship("CollegeLicense", back_populates="subscription_plan")


class CollegeLicense(Base):
    __tablename__ = "college_licenses"

    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, unique=True, nullable=False, index=True)
    contract_code = Column(String, default="") # e.g. "CONTRACT-2026-PCCOE-01"
    allowed_domain = Column(String, default="") # e.g. "pccoe.edu.in" or "vjti.ac.in"
    subscription_plan_id = Column(Integer, ForeignKey("subscription_plans.id"), nullable=True)
    max_students_allowed = Column(Integer, default=500)
    current_registered_count = Column(Integer, default=0)
    hod_email = Column(String, nullable=True)
    billing_contact_name = Column(String, default="")
    college_logo_url = Column(String, default="")
    auto_approve_domain_signup = Column(Boolean, default=True)
    status = Column(String, default="Active") # "Active", "Pending Renewal", "Expired", "Suspended"
    contract_start_date = Column(DateTime, server_default=func.now())
    contract_end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    subscription_plan = relationship("SubscriptionPlan", back_populates="college_licenses")
    users = relationship("User", back_populates="college_license")
