from fastapi import APIRouter, Depends, HTTPException, Query
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
