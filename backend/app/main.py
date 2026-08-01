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

# Import models to ensure tables are created
import app.modules.llm.models
import app.modules.practice.models
import app.modules.interviews.models

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


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


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
