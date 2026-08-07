import json
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_current_user_id, hash_password
from app.modules.auth.models import User
from app.modules.resumes.models import Resume
from app.modules.practice.models import QuestionProgress
from app.modules.interviews.models import InterviewSession
from app.modules.subscriptions.models import SubscriptionPlan, CollegeLicense
from app.modules.superadmin.router import get_current_superadmin

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

# -------------------------------------------------------------------------- #
#                             Pydantic Schemas                               #
# -------------------------------------------------------------------------- #

class PlanCreateRequest(BaseModel):
    name: str
    plan_type: str = "individual"
    price_monthly: float = 0.0
    price_yearly: float = 0.0
    currency: str = "INR"
    badge_tag: Optional[str] = ""
    discount_percentage: float = 0.0
    trial_period_days: int = 0
    max_resumes: int = 1
    max_mock_interviews_per_month: int = 2
    max_ats_scans_per_month: int = 3
    allow_custom_questions: bool = False
    allow_advanced_analytics: bool = False
    allow_proctoring_reports: bool = False
    support_level: str = "Standard"
    is_popular: bool = False
    features: List[str] = []

class CollegeLicenseCreateRequest(BaseModel):
    college_name: str
    contract_code: Optional[str] = ""
    allowed_domain: Optional[str] = ""
    subscription_plan_id: int
    max_students_allowed: int = 500
    hod_email: Optional[str] = ""
    billing_contact_name: Optional[str] = ""
    college_logo_url: Optional[str] = ""
    auto_approve_domain_signup: bool = True
    status: str = "Active"

class DomainTestRequest(BaseModel):
    email: EmailStr

# -------------------------------------------------------------------------- #
#                         Public & User Endpoints                            #
# -------------------------------------------------------------------------- #

@router.get("/plans")
def get_public_subscription_plans(db: Session = Depends(get_db)):
    plans = db.query(SubscriptionPlan).filter(SubscriptionPlan.is_active == True).all()
    result = []
    for p in plans:
        result.append({
            "id": p.id,
            "name": p.name,
            "plan_type": p.plan_type,
            "price_monthly": p.price_monthly,
            "price_yearly": p.price_yearly,
            "currency": getattr(p, "currency", "INR") or "INR",
            "badge_tag": getattr(p, "badge_tag", "") or "",
            "discount_percentage": getattr(p, "discount_percentage", 0.0) or 0.0,
            "trial_period_days": getattr(p, "trial_period_days", 0) or 0,
            "max_resumes": p.max_resumes,
            "max_mock_interviews_per_month": p.max_mock_interviews_per_month,
            "max_ats_scans_per_month": p.max_ats_scans_per_month,
            "allow_custom_questions": p.allow_custom_questions,
            "allow_advanced_analytics": p.allow_advanced_analytics,
            "allow_proctoring_reports": getattr(p, "allow_proctoring_reports", False) or False,
            "support_level": getattr(p, "support_level", "Standard") or "Standard",
            "is_popular": getattr(p, "is_popular", False) or False,
            "features": json.loads(p.features_json) if p.features_json else []
        })
    return result


@router.get("/my-plan")
def get_my_subscription_plan(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan = None
    if user.subscription_plan_id:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == user.subscription_plan_id).first()
    elif user.college_license_id:
        license_obj = db.query(CollegeLicense).filter(CollegeLicense.id == user.college_license_id).first()
        if license_obj and license_obj.subscription_plan_id:
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == license_obj.subscription_plan_id).first()

    if not plan:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Free Basic").first()

    resumes_used = db.query(Resume).filter(Resume.user_id == user.id).count()
    interviews_used = db.query(InterviewSession).filter(InterviewSession.user_id == user.id).count()
    tests_used = db.query(QuestionProgress).filter(QuestionProgress.user_id == user.id).count()

    college_name = user.college_name
    college_domain = ""
    if user.college_license:
        college_domain = user.college_license.allowed_domain

    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "college_name": college_name,
        "college_domain": college_domain,
        "plan": {
            "id": plan.id if plan else None,
            "name": plan.name if plan else "Free Basic",
            "plan_type": plan.plan_type if plan else "individual",
            "max_resumes": plan.max_resumes if plan else 1,
            "max_mock_interviews_per_month": plan.max_mock_interviews_per_month if plan else 2,
            "max_ats_scans_per_month": plan.max_ats_scans_per_month if plan else 3,
            "features": json.loads(plan.features_json) if (plan and plan.features_json) else []
        },
        "usage": {
            "resumes_used": resumes_used,
            "interviews_used": interviews_used,
            "tests_used": tests_used
        }
    }


# -------------------------------------------------------------------------- #
#                       Super Admin Management Endpoints                      #
# -------------------------------------------------------------------------- #

@router.post("/superadmin/plans", status_code=201)
def create_subscription_plan(
    req: PlanCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    plan = SubscriptionPlan(
        name=req.name,
        plan_type=req.plan_type,
        price_monthly=req.price_monthly,
        price_yearly=req.price_yearly,
        currency=req.currency,
        badge_tag=req.badge_tag or "",
        discount_percentage=req.discount_percentage,
        trial_period_days=req.trial_period_days,
        max_resumes=req.max_resumes,
        max_mock_interviews_per_month=req.max_mock_interviews_per_month,
        max_ats_scans_per_month=req.max_ats_scans_per_month,
        allow_custom_questions=req.allow_custom_questions,
        allow_advanced_analytics=req.allow_advanced_analytics,
        allow_proctoring_reports=req.allow_proctoring_reports,
        support_level=req.support_level,
        is_popular=req.is_popular,
        features_json=json.dumps(req.features)
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"id": plan.id, "name": plan.name, "message": "Plan created successfully"}


@router.put("/superadmin/plans/{plan_id}")
def update_subscription_plan(
    plan_id: int,
    req: PlanCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.name = req.name
    plan.plan_type = req.plan_type
    plan.price_monthly = req.price_monthly
    plan.price_yearly = req.price_yearly
    plan.currency = req.currency
    plan.badge_tag = req.badge_tag or ""
    plan.discount_percentage = req.discount_percentage
    plan.trial_period_days = req.trial_period_days
    plan.max_resumes = req.max_resumes
    plan.max_mock_interviews_per_month = req.max_mock_interviews_per_month
    plan.max_ats_scans_per_month = req.max_ats_scans_per_month
    plan.allow_custom_questions = req.allow_custom_questions
    plan.allow_advanced_analytics = req.allow_advanced_analytics
    plan.allow_proctoring_reports = req.allow_proctoring_reports
    plan.support_level = req.support_level
    plan.is_popular = req.is_popular
    plan.features_json = json.dumps(req.features)

    db.commit()
    return {"id": plan.id, "message": "Plan updated successfully"}


@router.delete("/superadmin/plans/{plan_id}")
def delete_subscription_plan(
    plan_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    db.delete(plan)
    db.commit()
    return {"message": f"Plan ID {plan_id} deleted"}


@router.get("/superadmin/college-licenses")
def list_college_licenses(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    licenses = db.query(CollegeLicense).all()
    result = []
    for lic in licenses:
        student_count = db.query(User).filter(User.college_license_id == lic.id).count()
        plan_name = lic.subscription_plan.name if lic.subscription_plan else "Unassigned"
        
        result.append({
            "id": lic.id,
            "college_name": lic.college_name,
            "contract_code": getattr(lic, "contract_code", "") or "",
            "allowed_domain": lic.allowed_domain,
            "subscription_plan_id": lic.subscription_plan_id,
            "subscription_plan_name": plan_name,
            "max_students_allowed": lic.max_students_allowed,
            "current_registered_count": student_count,
            "hod_email": lic.hod_email,
            "billing_contact_name": getattr(lic, "billing_contact_name", "") or "",
            "college_logo_url": getattr(lic, "college_logo_url", "") or "",
            "auto_approve_domain_signup": getattr(lic, "auto_approve_domain_signup", True),
            "status": getattr(lic, "status", "Active") or "Active",
            "is_active": lic.is_active,
            "created_at": lic.created_at.isoformat() if lic.created_at else ""
        })
    return result


@router.post("/superadmin/college-licenses", status_code=201)
def create_college_license(
    req: CollegeLicenseCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    license_obj = CollegeLicense(
        college_name=req.college_name,
        contract_code=req.contract_code or "",
        allowed_domain=req.allowed_domain or "",
        subscription_plan_id=req.subscription_plan_id,
        max_students_allowed=req.max_students_allowed,
        hod_email=req.hod_email,
        billing_contact_name=req.billing_contact_name or "",
        college_logo_url=req.college_logo_url or "",
        auto_approve_domain_signup=req.auto_approve_domain_signup,
        status=req.status
    )
    db.add(license_obj)
    db.commit()
    db.refresh(license_obj)
    return {"id": license_obj.id, "college_name": license_obj.college_name, "message": "College license created"}


@router.put("/superadmin/college-licenses/{license_id}")
def update_college_license(
    license_id: int,
    req: CollegeLicenseCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    lic = db.query(CollegeLicense).filter(CollegeLicense.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="College license not found")

    lic.college_name = req.college_name
    lic.contract_code = req.contract_code or ""
    lic.allowed_domain = req.allowed_domain or ""
    lic.subscription_plan_id = req.subscription_plan_id
    lic.max_students_allowed = req.max_students_allowed
    lic.hod_email = req.hod_email
    lic.billing_contact_name = req.billing_contact_name or ""
    lic.college_logo_url = req.college_logo_url or ""
    lic.auto_approve_domain_signup = req.auto_approve_domain_signup
    lic.status = req.status

    db.commit()
    return {"id": lic.id, "college_name": lic.college_name, "message": "College license updated"}


@router.delete("/superadmin/college-licenses/{license_id}")
def delete_college_license(
    license_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    lic = db.query(CollegeLicense).filter(CollegeLicense.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="College license not found")

    db.delete(lic)
    db.commit()
    return {"message": f"College license ID {license_id} deleted"}


@router.post("/superadmin/test-domain-verification")
def test_domain_verification(
    req: DomainTestRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    email = req.email.lower()
    domain = email.split("@")[-1] if "@" in email else ""

    matched_license = db.query(CollegeLicense).filter(CollegeLicense.allowed_domain.ilike(domain)).first()
    if matched_license:
        plan = matched_license.subscription_plan
        return {
            "matched": True,
            "domain": domain,
            "college_name": matched_license.college_name,
            "contract_code": matched_license.contract_code,
            "plan_name": plan.name if plan else "Enterprise Plan",
            "auto_claim_unlocked": matched_license.auto_approve_domain_signup,
            "message": f"Student email @{domain} automatically claims {matched_license.college_name} enterprise plan!"
        }
    
    return {
        "matched": False,
        "domain": domain,
        "message": f"No active college license configured for domain @{domain}."
    }
