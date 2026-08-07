import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.modules.auth.router import router as auth_router
from app.modules.resumes.router import router as resumes_router
from app.modules.jobs.router import router as jobs_router
from app.modules.linkedin.router import router as linkedin_router
from app.modules.practice.router import router as practice_router
from app.modules.aptitude.router import router as aptitude_router
from app.modules.interviews.router import router as interviews_router
from app.modules.superadmin.router import router as superadmin_router
from app.modules.subscriptions.router import router as subscriptions_router
from app.modules.auth.service import seed_superadmin_user

# Import models to ensure tables are created
import app.modules.llm.models
import app.modules.practice.models
import app.modules.interviews.models
import app.modules.subscriptions.models
from app.modules.interviews.prompts import seed_interview_categories
from app.modules.subscriptions.service import seed_subscription_plans

app = FastAPI(title="ResumeHive API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(linkedin_router)
app.include_router(practice_router)
app.include_router(aptitude_router)
app.include_router(interviews_router)
app.include_router(superadmin_router)
app.include_router(subscriptions_router)


from sqlalchemy import inspect, text

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    try:
        inspector = inspect(engine)
        if inspector.has_table("users"):
            columns = [col["name"] for col in inspector.get_columns("users")]
            if "role" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student';"))
                print("[Migration] Successfully added 'role' column to users table.")
            if "subscription_plan_id" not in columns:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN subscription_plan_id INTEGER DEFAULT NULL;"))
                    conn.execute(text("ALTER TABLE users ADD COLUMN college_license_id INTEGER DEFAULT NULL;"))
                print("[Migration] Added subscription_plan_id and college_license_id to users table.")

        if inspector.has_table("subscription_plans"):
            plan_cols = [col["name"] for col in inspector.get_columns("subscription_plans")]
            if "currency" not in plan_cols:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN currency VARCHAR DEFAULT 'INR';"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN badge_tag VARCHAR DEFAULT '';"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN discount_percentage FLOAT DEFAULT 0.0;"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN trial_period_days INTEGER DEFAULT 0;"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN allow_proctoring_reports BOOLEAN DEFAULT 0;"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN support_level VARCHAR DEFAULT 'Standard';"))
                    conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN is_popular BOOLEAN DEFAULT 0;"))

        if inspector.has_table("college_licenses"):
            lic_cols = [col["name"] for col in inspector.get_columns("college_licenses")]
            if "contract_code" not in lic_cols:
                with engine.begin() as conn:
                    conn.execute(text("ALTER TABLE college_licenses ADD COLUMN contract_code VARCHAR DEFAULT '';"))
                    conn.execute(text("ALTER TABLE college_licenses ADD COLUMN billing_contact_name VARCHAR DEFAULT '';"))
                    conn.execute(text("ALTER TABLE college_licenses ADD COLUMN college_logo_url VARCHAR DEFAULT '';"))
                    conn.execute(text("ALTER TABLE college_licenses ADD COLUMN auto_approve_domain_signup BOOLEAN DEFAULT 1;"))
                    conn.execute(text("ALTER TABLE college_licenses ADD COLUMN status VARCHAR DEFAULT 'Active';"))
    except Exception as e:
        print(f"[Migration] Note: {e}")

    db = SessionLocal()
    try:
        seed_superadmin_user(db)
        seed_interview_categories(db)
        seed_subscription_plans(db)
    except Exception as e:
        print(f"Error syncing startup seeds: {e}")
    finally:
        db.close()


@app.get("/health")
def health():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    return {"status": "ok", "database": "connected" if db_ok else "error"}
