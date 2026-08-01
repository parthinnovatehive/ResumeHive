from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
import tempfile
import subprocess
import os

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.modules.practice.models import (
    Company,
    CompanyQuestionStat,
    Question,
    QuestionProgress,
)
from app.modules.practice.schemas import (
    CompanyOut,
    PaginatedProgress,
    PaginatedQuestions,
    ProgressQuestionOut,
    QuestionOut,
    RevisitUpdate,
    StatusUpdate,
)

router = APIRouter(prefix="/api", tags=["practice"])

class ExecuteRequest(BaseModel):
    language: str
    code: str

@router.post("/execute")
def execute_code(body: ExecuteRequest):
    lang = body.language.lower()
    code = body.code
    
    with tempfile.TemporaryDirectory() as temp_dir:
        if lang == "python":
            file_path = os.path.join(temp_dir, "main.py")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            try:
                result = subprocess.run(["python", file_path], capture_output=True, text=True, timeout=5)
                return {"stdout": result.stdout, "stderr": result.stderr}
            except subprocess.TimeoutExpired:
                return {"stdout": "", "stderr": "Execution timed out."}
        
        elif lang == "javascript":
            file_path = os.path.join(temp_dir, "main.js")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            try:
                result = subprocess.run(["node", file_path], capture_output=True, text=True, timeout=5)
                return {"stdout": result.stdout, "stderr": result.stderr}
            except subprocess.TimeoutExpired:
                return {"stdout": "", "stderr": "Execution timed out."}
                
        elif lang == "java":
            file_path = os.path.join(temp_dir, "Main.java")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            try:
                subprocess.run(["javac", file_path], capture_output=True, text=True, timeout=5, check=True)
                result = subprocess.run(["java", "-cp", temp_dir, "Main"], capture_output=True, text=True, timeout=5)
                return {"stdout": result.stdout, "stderr": result.stderr}
            except subprocess.CalledProcessError as e:
                return {"stdout": "", "stderr": e.stderr}
            except subprocess.TimeoutExpired:
                return {"stdout": "", "stderr": "Execution timed out."}
                
        elif lang == "cpp":
            file_path = os.path.join(temp_dir, "main.cpp")
            out_path = os.path.join(temp_dir, "main.exe")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            try:
                subprocess.run(["gcc", file_path, "-lstdc++", "-o", out_path], capture_output=True, text=True, timeout=5, check=True)
                result = subprocess.run([out_path], capture_output=True, text=True, timeout=5)
                return {"stdout": result.stdout, "stderr": result.stderr}
            except subprocess.CalledProcessError as e:
                return {"stdout": "", "stderr": e.stderr}
            except subprocess.TimeoutExpired:
                return {"stdout": "", "stderr": "Execution timed out."}

        elif lang == "c":
            file_path = os.path.join(temp_dir, "main.c")
            out_path = os.path.join(temp_dir, "main.exe")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(code)
            try:
                subprocess.run(["gcc", file_path, "-o", out_path], capture_output=True, text=True, timeout=5, check=True)
                result = subprocess.run([out_path], capture_output=True, text=True, timeout=5)
                return {"stdout": result.stdout, "stderr": result.stderr}
            except subprocess.CalledProcessError as e:
                return {"stdout": "", "stderr": e.stderr}
            except subprocess.TimeoutExpired:
                return {"stdout": "", "stderr": "Execution timed out."}
        else:
            raise HTTPException(status_code=400, detail="Unsupported language")

TIME_WINDOW_MAP = {
    "thirty_days": "THIRTY_DAYS",
    "three_months": "THREE_MONTHS",
    "six_months": "SIX_MONTHS",
    "more_than_six_months": "MORE_THAN_SIX_MONTHS",
    "all": "ALL",
}

VALID_DIFFICULTIES = {"EASY", "MEDIUM", "HARD"}
VALID_STATUSES = {"attempted", "solved"}


@router.get("/companies", response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).order_by(Company.name).all()


@router.get("/companies/{slug}/questions", response_model=PaginatedQuestions)
def company_questions(
    slug: str,
    user_id: int = Depends(get_current_user_id),
    time_window: str = Query(default="all"),
    difficulty: str = Query(default=None),
    sort: str = Query(default="frequency"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.slug == slug).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    tw = TIME_WINDOW_MAP.get(time_window.lower())
    if not tw:
        raise HTTPException(status_code=400, detail=f"Invalid time_window: {time_window}")

    query = (
        db.query(Question, CompanyQuestionStat.frequency, QuestionProgress)
        .join(CompanyQuestionStat, CompanyQuestionStat.question_id == Question.id)
        .outerjoin(
            QuestionProgress,
            (QuestionProgress.question_id == Question.id)
            & (QuestionProgress.user_id == user_id),
        )
        .filter(CompanyQuestionStat.company_id == company.id)
        .filter(CompanyQuestionStat.time_window == tw)
    )

    if difficulty and difficulty.upper() in VALID_DIFFICULTIES:
        query = query.filter(Question.difficulty == difficulty.upper())

    total = query.count()

    if sort == "acceptance_rate":
        order = asc(Question.acceptance_rate)
    else:
        order = desc(CompanyQuestionStat.frequency)

    rows = query.order_by(order).offset(offset).limit(limit).all()

    items = []
    for q, freq, prog in rows:
        items.append(
            QuestionOut(
                id=q.id,
                title=q.title,
                difficulty=q.difficulty,
                frequency=freq,
                acceptance_rate=q.acceptance_rate,
                link=q.link,
                status=prog.status if prog else None,
                revisit_later=prog.revisit_later if prog else False,
            )
        )

    return PaginatedQuestions(items=items, total=total, limit=limit, offset=offset)


@router.post("/questions/{question_id}/status")
def set_question_status(
    question_id: int,
    body: StatusUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    prog = (
        db.query(QuestionProgress)
        .filter(
            QuestionProgress.user_id == user_id,
            QuestionProgress.question_id == question_id,
        )
        .first()
    )

    if prog:
        prog.status = body.status
    else:
        prog = QuestionProgress(
            user_id=user_id,
            question_id=question_id,
            status=body.status,
            revisit_later=False,
        )
        db.add(prog)

    db.commit()
    return {"status": prog.status, "revisit_later": prog.revisit_later}


@router.post("/questions/{question_id}/revisit")
def set_question_revisit(
    question_id: int,
    body: RevisitUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    prog = (
        db.query(QuestionProgress)
        .filter(
            QuestionProgress.user_id == user_id,
            QuestionProgress.question_id == question_id,
        )
        .first()
    )

    if prog:
        prog.revisit_later = body.revisit_later
    else:
        prog = QuestionProgress(
            user_id=user_id,
            question_id=question_id,
            status=None,
            revisit_later=body.revisit_later,
        )
        db.add(prog)

    db.commit()
    return {"status": prog.status, "revisit_later": prog.revisit_later}


@router.delete("/questions/{question_id}/status")
def clear_question_status(
    question_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    prog = (
        db.query(QuestionProgress)
        .filter(
            QuestionProgress.user_id == user_id,
            QuestionProgress.question_id == question_id,
        )
        .first()
    )

    if not prog:
        return {"status": None, "revisit_later": False}

    if prog.revisit_later:
        prog.status = None
    else:
        db.delete(prog)

    db.commit()
    return {"status": None, "revisit_later": prog.revisit_later if prog.revisit_later else False}


@router.get("/questions/my-progress", response_model=PaginatedProgress)
def my_progress(
    user_id: int = Depends(get_current_user_id),
    status: str = Query(default=None),
    revisit_later: bool | None = Query(default=None),
    company_slug: str = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = (
        db.query(QuestionProgress, Question)
        .join(Question, Question.id == QuestionProgress.question_id)
        .filter(QuestionProgress.user_id == user_id)
    )

    if status:
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        query = query.filter(QuestionProgress.status == status)

    if revisit_later is not None:
        query = query.filter(QuestionProgress.revisit_later == revisit_later)

    if company_slug:
        company = db.query(Company).filter(Company.slug == company_slug).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        query = query.join(
            CompanyQuestionStat,
            CompanyQuestionStat.question_id == Question.id,
        ).filter(CompanyQuestionStat.company_id == company.id)

    total = query.count()
    rows = query.order_by(desc(QuestionProgress.updated_at)).offset(offset).limit(limit).all()

    items = [
        ProgressQuestionOut(
            id=q.id,
            title=q.title,
            link=q.link,
            difficulty=q.difficulty,
            acceptance_rate=q.acceptance_rate,
            status=prog.status,
            revisit_later=prog.revisit_later,
            created_at=prog.created_at,
            updated_at=prog.updated_at,
        )
        for prog, q in rows
    ]

    return PaginatedProgress(items=items, total=total, limit=limit, offset=offset)


@router.get("/assessments", response_model=list[dict])
def get_assessments(db: Session = Depends(get_db)):
    from app.modules.practice.models import Assessment
    assessments = db.query(Assessment).all()
    return [{"id": a.id, "title": a.title, "duration_minutes": a.duration_minutes} for a in assessments]


@router.get("/assessments/{assessment_id}/questions", response_model=list[dict])
def get_assessment_questions(assessment_id: int, db: Session = Depends(get_db)):
    from app.modules.practice.models import AssessmentQuestion
    questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == assessment_id).all()
    return [
        {
            "id": q.id,
            "assessment_id": q.assessment_id,
            "title": q.title,
            "description_html": q.description_html,
            "difficulty": q.difficulty,
            "constraints": q.constraints,
            "test_cases_json": q.test_cases_json,
            "js_stub": q.js_stub,
            "python_stub": q.python_stub,
            "java_stub": q.java_stub,
            "cpp_stub": q.cpp_stub,
            "c_stub": q.c_stub,
        }
        for q in questions
    ]
