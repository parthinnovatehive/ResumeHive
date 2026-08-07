import json
from sqlalchemy.orm import Session
from app.modules.subscriptions.models import SubscriptionPlan, CollegeLicense

def seed_subscription_plans(db: Session):
    # 1. Free Basic Plan
    free_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Free Basic").first()
    if not free_plan:
        free_plan = SubscriptionPlan(
            name="Free Basic",
            plan_type="individual",
            price_monthly=0.0,
            price_yearly=0.0,
            max_resumes=1,
            max_mock_interviews_per_month=2,
            max_ats_scans_per_month=3,
            allow_custom_questions=False,
            allow_advanced_analytics=False,
            features_json=json.dumps([
                "1 ATS Resume Builder",
                "2 AI Mock Interviews / month",
                "3 ATS Resume Score Scans",
                "Basic Coding Practice"
            ])
        )
        db.add(free_plan)

    # 2. Pro Student Plan
    pro_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "Pro Student").first()
    if not pro_plan:
        pro_plan = SubscriptionPlan(
            name="Pro Student",
            plan_type="individual",
            price_monthly=499.0,
            price_yearly=3999.0,
            max_resumes=5,
            max_mock_interviews_per_month=15,
            max_ats_scans_per_month=20,
            allow_custom_questions=True,
            allow_advanced_analytics=True,
            features_json=json.dumps([
                "Up to 5 Tailored ATS Resumes",
                "15 AI Mock Interviews / month",
                "20 Deep ATS Score Audits",
                "Full LeetCode Question Bank Access",
                "Advanced AI Performance Analytics"
            ])
        )
        db.add(pro_plan)

    # 3. College Enterprise Gold Plan
    college_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "College Enterprise Gold").first()
    if not college_plan:
        college_plan = SubscriptionPlan(
            name="College Enterprise Gold",
            plan_type="college",
            price_monthly=49999.0,
            price_yearly=399999.0,
            max_resumes=-1,
            max_mock_interviews_per_month=-1,
            max_ats_scans_per_month=-1,
            allow_custom_questions=True,
            allow_advanced_analytics=True,
            features_json=json.dumps([
                "Unlimited Resumes for All Campus Students",
                "Unlimited AI Mock Interviews & Video Proctoring",
                "Unlimited ATS Resume Scans",
                "HOD & Teacher Department Analytics Portal",
                "Custom Email Domain Auto-Verification",
                "Bulk Student CSV Onboarding"
            ])
        )
        db.add(college_plan)

    db.commit()

    # Seed Default College License (PCCOE Pune)
    college = db.query(CollegeLicense).filter(CollegeLicense.college_name == "Pimpri Chinchwad College of Engineering (PCCOE)").first()
    if not college:
        c_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == "College Enterprise Gold").first()
        college = CollegeLicense(
            college_name="Pimpri Chinchwad College of Engineering (PCCOE)",
            allowed_domain="pccoe.edu.in",
            subscription_plan_id=c_plan.id if c_plan else None,
            max_students_allowed=1000,
            hod_email="hod.cse@pccoe.edu.in"
        )
        db.add(college)
        db.commit()
