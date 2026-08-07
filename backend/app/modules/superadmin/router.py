import json
import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.core.security import get_current_user_id, hash_password
from app.modules.auth.models import User
from app.modules.resumes.models import Resume
from app.modules.practice.models import Assessment, AssessmentQuestion, QuestionProgress, Question, Company
from app.modules.interviews.models import InterviewCategory, InterviewSession, InterviewSessionFlag

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])


def get_current_superadmin(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user or (user.role != "superadmin" and user.email != "superadmin@gmail.com"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required"
        )
    return user


# -------------------------------------------------------------------------- #
#                             Pydantic Schemas                               #
# -------------------------------------------------------------------------- #

class StudentCreateRequest(BaseModel):
    email: EmailStr
    password: str
    college_name: Optional[str] = ""
    role: Optional[str] = "student"

class StudentUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    college_name: Optional[str] = None
    role: Optional[str] = None
    headline: Optional[str] = None
    about: Optional[str] = None

class AssessmentCreateRequest(BaseModel):
    title: str
    duration_minutes: int = 60

class AssessmentUpdateRequest(BaseModel):
    title: Optional[str] = None
    duration_minutes: Optional[int] = None

class QuestionCreateRequest(BaseModel):
    assessment_id: int
    title: str
    description_html: str
    difficulty: str = "Medium"
    constraints: Optional[str] = None
    test_cases_json: str = "[]"
    python_stub: Optional[str] = None
    js_stub: Optional[str] = None
    java_stub: Optional[str] = None
    cpp_stub: Optional[str] = None

class QuestionUpdateRequest(BaseModel):
    title: Optional[str] = None
    description_html: Optional[str] = None
    difficulty: Optional[str] = None
    constraints: Optional[str] = None
    test_cases_json: Optional[str] = None
    python_stub: Optional[str] = None
    js_stub: Optional[str] = None
    java_stub: Optional[str] = None
    cpp_stub: Optional[str] = None

class InterviewCategoryCreateRequest(BaseModel):
    name: str
    slug: str
    system_prompt_template: str
    is_active: bool = True

class InterviewCategoryUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    system_prompt_template: Optional[str] = None
    is_active: Optional[bool] = None


# -------------------------------------------------------------------------- #
#                        1. Overview & System Stats                          #
# -------------------------------------------------------------------------- #

@router.get("/stats")
def get_system_stats(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    total_students = db.query(User).filter(User.role != "superadmin").count()
    total_resumes = db.query(Resume).count()
    total_assessments = db.query(Assessment).count()
    total_questions = db.query(AssessmentQuestion).count()
    total_interviews = db.query(InterviewSession).count()
    completed_interviews = db.query(InterviewSession).filter(InterviewSession.status == "completed").count()

    recent_students = db.query(User).filter(User.role != "superadmin").order_by(User.created_at.desc()).limit(5).all()
    recent_activity = [
        {
            "id": s.id,
            "email": s.email,
            "college": s.college_name or "N/A",
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in recent_students
    ]

    return {
        "total_students": total_students,
        "total_resumes": total_resumes,
        "total_assessments": total_assessments,
        "total_questions": total_questions,
        "total_interviews": total_interviews,
        "completed_interviews": completed_interviews,
        "recent_students": recent_activity
    }


# -------------------------------------------------------------------------- #
#                       2. Student Management (CRUD)                          #
# -------------------------------------------------------------------------- #

@router.get("/students")
def list_students(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role != "superadmin")
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | (User.college_name.ilike(f"%{search}%"))
        )

    students = query.order_by(User.id.desc()).offset(skip).limit(limit).all()

    result = []
    for s in students:
        resume_count = db.query(Resume).filter(Resume.user_id == s.id).count()
        test_count = db.query(QuestionProgress).filter(QuestionProgress.user_id == s.id).count()
        interview_count = db.query(InterviewSession).filter(InterviewSession.user_id == s.id).count()
        
        result.append({
            "id": s.id,
            "email": s.email,
            "college_name": s.college_name or "",
            "role": s.role or "student",
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "headline": s.headline,
            "resumes_count": resume_count,
            "tests_taken": test_count,
            "interviews_taken": interview_count
        })

    return result


@router.get("/students/{user_id}")
def get_student_details(
    user_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    resumes = db.query(Resume).filter(Resume.user_id == user_id).all()
    test_progress = db.query(QuestionProgress).filter(QuestionProgress.user_id == user_id).all()
    interviews = db.query(InterviewSession).filter(InterviewSession.user_id == user_id).order_by(InterviewSession.started_at.desc()).all()

    interview_details = []
    for iv in interviews:
        flag_count = db.query(InterviewSessionFlag).filter(InterviewSessionFlag.session_id == iv.id).count()
        interview_details.append({
            "id": iv.id,
            "category_name": iv.category.name if iv.category else "General",
            "status": iv.status,
            "flag_count": flag_count,
            "started_at": iv.started_at.isoformat() if iv.started_at else None,
            "completed_at": iv.completed_at.isoformat() if iv.completed_at else None,
            "report": iv.report
        })

    return {
        "id": student.id,
        "email": student.email,
        "college_name": student.college_name,
        "role": student.role,
        "created_at": student.created_at.isoformat() if student.created_at else "",
        "headline": student.headline,
        "about": student.about,
        "top_skills": json.loads(student.top_skills) if student.top_skills else [],
        "resumes": [{"id": r.id, "created_at": r.created_at.isoformat() if r.created_at else ""} for r in resumes],
        "tests_taken_count": len(test_progress),
        "interviews": interview_details
    }


@router.post("/students", status_code=201)
def create_student(
    req: StudentCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        college_name=req.college_name or "",
        role=req.role or "student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "email": user.email, "role": user.role, "message": "User created successfully"}


@router.put("/students/{user_id}")
def update_student(
    user_id: int,
    req: StudentUpdateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if req.email is not None:
        student.email = req.email
    if req.college_name is not None:
        student.college_name = req.college_name
    if req.role is not None:
        student.role = req.role
    if req.headline is not None:
        student.headline = req.headline
    if req.about is not None:
        student.about = req.about

    db.commit()
    db.refresh(student)

    return {"id": student.id, "email": student.email, "message": "Student updated successfully"}


@router.delete("/students/{user_id}")
def delete_student(
    user_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()

    return {"message": f"Student ID {user_id} deleted successfully"}


# -------------------------------------------------------------------------- #
#                   3. Assessments & Questions CRUD                          #
# -------------------------------------------------------------------------- #

@router.get("/assessments")
def list_assessments(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).all()
    result = []
    for a in assessments:
        q_count = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == a.id).count()
        result.append({
            "id": a.id,
            "title": a.title,
            "duration_minutes": a.duration_minutes,
            "questions_count": q_count
        })
    return result


@router.post("/assessments", status_code=201)
def create_assessment(
    req: AssessmentCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    assessment = Assessment(
        title=req.title,
        duration_minutes=req.duration_minutes
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return {"id": assessment.id, "title": assessment.title, "duration_minutes": assessment.duration_minutes}


@router.put("/assessments/{assessment_id}")
def update_assessment(
    assessment_id: int,
    req: AssessmentUpdateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if req.title is not None:
        assessment.title = req.title
    if req.duration_minutes is not None:
        assessment.duration_minutes = req.duration_minutes

    db.commit()
    db.refresh(assessment)
    return {"id": assessment.id, "title": assessment.title, "duration_minutes": assessment.duration_minutes}


@router.delete("/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    db.delete(assessment)
    db.commit()
    return {"message": f"Assessment ID {assessment_id} deleted"}


@router.get("/questions")
def list_questions(
    assessment_id: Optional[int] = None,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    query = db.query(AssessmentQuestion)
    if assessment_id:
        query = query.filter(AssessmentQuestion.assessment_id == assessment_id)

    questions = query.all()
    return [
        {
            "id": q.id,
            "assessment_id": q.assessment_id,
            "title": q.title,
            "difficulty": q.difficulty,
            "description_html": q.description_html,
            "constraints": q.constraints,
            "test_cases_json": q.test_cases_json,
            "python_stub": q.python_stub,
            "js_stub": q.js_stub,
            "java_stub": q.java_stub,
            "cpp_stub": q.cpp_stub
        }
        for q in questions
    ]


@router.post("/questions", status_code=201)
def create_question(
    req: QuestionCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == req.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment ID does not exist")

    q = AssessmentQuestion(
        assessment_id=req.assessment_id,
        title=req.title,
        description_html=req.description_html,
        difficulty=req.difficulty,
        constraints=req.constraints,
        test_cases_json=req.test_cases_json,
        python_stub=req.python_stub,
        js_stub=req.js_stub,
        java_stub=req.java_stub,
        cpp_stub=req.cpp_stub
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": q.id, "title": q.title, "assessment_id": q.assessment_id}


@router.put("/questions/{question_id}")
def update_question(
    question_id: int,
    req: QuestionUpdateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    if req.title is not None:
        q.title = req.title
    if req.description_html is not None:
        q.description_html = req.description_html
    if req.difficulty is not None:
        q.difficulty = req.difficulty
    if req.constraints is not None:
        q.constraints = req.constraints
    if req.test_cases_json is not None:
        q.test_cases_json = req.test_cases_json
    if req.python_stub is not None:
        q.python_stub = req.python_stub
    if req.js_stub is not None:
        q.js_stub = req.js_stub
    if req.java_stub is not None:
        q.java_stub = req.java_stub
    if req.cpp_stub is not None:
        q.cpp_stub = req.cpp_stub

    db.commit()
    db.refresh(q)
    return {"id": q.id, "title": q.title, "message": "Question updated successfully"}


@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    db.delete(q)
    db.commit()
    return {"message": f"Question ID {question_id} deleted successfully"}


@router.post("/assessments/import-csv")
async def import_assessments_csv(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    content = await file.read()
    csv_text = content.decode("utf-8")
    csv_file = io.StringIO(csv_text)
    reader = csv.DictReader(csv_file)

    imported_count = 0
    assessments_cache = {}

    for row in reader:
        test_title = row.get("Test_Title") or row.get("test_title") or "Technical Assessment"
        duration = int(row.get("Duration") or 60)
        
        if test_title not in assessments_cache:
            assessment = db.query(Assessment).filter(Assessment.title == test_title).first()
            if not assessment:
                assessment = Assessment(title=test_title, duration_minutes=duration)
                db.add(assessment)
                db.commit()
                db.refresh(assessment)
            assessments_cache[test_title] = assessment.id

        q_title = row.get("Question_Title") or row.get("title") or "Coding Problem"
        description = row.get("Problem_Description") or row.get("description") or "<p>Solve the problem.</p>"
        difficulty = row.get("Difficulty") or "Medium"
        constraints = row.get("Constraints") or ""
        test_cases = row.get("Sample_Test_Cases") or row.get("test_cases") or "[]"
        py_stub = row.get("Starter_Code_Python") or ""
        js_stub = row.get("Starter_Code_JS") or ""

        question = AssessmentQuestion(
            assessment_id=assessments_cache[test_title],
            title=q_title,
            description_html=description,
            difficulty=difficulty,
            constraints=constraints,
            test_cases_json=test_cases,
            python_stub=py_stub,
            js_stub=js_stub
        )
        db.add(question)
        imported_count += 1

    db.commit()
    return {"message": f"Successfully imported {imported_count} questions from CSV"}


# -------------------------------------------------------------------------- #
#                   4. Mock Interview Categories & Sessions                  #
# -------------------------------------------------------------------------- #

@router.get("/interviews/categories")
def list_interview_categories(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    categories = db.query(InterviewCategory).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "system_prompt_template": c.system_prompt_template,
            "is_active": c.is_active
        }
        for c in categories
    ]


@router.post("/interviews/categories", status_code=201)
def create_interview_category(
    req: InterviewCategoryCreateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    existing = db.query(InterviewCategory).filter(InterviewCategory.slug == req.slug).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category slug already exists")

    cat = InterviewCategory(
        name=req.name,
        slug=req.slug,
        system_prompt_template=req.system_prompt_template,
        is_active=req.is_active
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "slug": cat.slug}


@router.put("/interviews/categories/{cat_id}")
def update_interview_category(
    cat_id: int,
    req: InterviewCategoryUpdateRequest,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    cat = db.query(InterviewCategory).filter(InterviewCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if req.name is not None:
        cat.name = req.name
    if req.slug is not None:
        cat.slug = req.slug
    if req.system_prompt_template is not None:
        cat.system_prompt_template = req.system_prompt_template
    if req.is_active is not None:
        cat.is_active = req.is_active

    db.commit()
    db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "message": "Category updated successfully"}


@router.delete("/interviews/categories/{cat_id}")
def delete_interview_category(
    cat_id: int,
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    cat = db.query(InterviewCategory).filter(InterviewCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(cat)
    db.commit()
    return {"message": f"Interview Category ID {cat_id} deleted successfully"}


@router.get("/interviews/sessions")
def list_interview_sessions(
    admin: User = Depends(get_current_superadmin),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).order_by(InterviewSession.started_at.desc()).limit(100).all()
    result = []
    for s in sessions:
        student = db.query(User).filter(User.id == s.user_id).first()
        flag_count = db.query(InterviewSessionFlag).filter(InterviewSessionFlag.session_id == s.id).count()
        result.append({
            "id": s.id,
            "user_id": s.user_id,
            "student_email": student.email if student else "Unknown User",
            "category_name": s.category.name if s.category else "General",
            "status": s.status,
            "flag_count": flag_count,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "report": s.report
        })
    return result
