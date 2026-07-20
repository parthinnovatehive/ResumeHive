"""Business logic for resume CRUD operations."""

import json
import math
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.resumes.models import Resume
from app.modules.resumes.schemas import (
    ResumeCreate,
    ResumeFullUpdate,
    ResumeResponse,
    ResumeUpdate,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

JSON_FIELDS = frozenset(
    {"education", "experience", "projects", "skills", "certifications", "section_order"}
)


def _load_json(val: str | None) -> Any:
    """Deserialise a JSON string, returning the original on failure."""
    if val is None:
        return []
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


def _to_response(r: Resume) -> ResumeResponse:
    """Convert an ORM Resume row into a Pydantic response model."""
    return ResumeResponse(
        id=r.id,
        user_id=r.user_id,
        full_name=r.full_name or "",
        email=r.email or "",
        phone=r.phone or "",
        location=r.location or "",
        linkedin_url=r.linkedin_url or "",
        summary=r.summary or "",
        education=_load_json(r.education),
        experience=_load_json(r.experience),
        projects=_load_json(r.projects),
        skills=_load_json(r.skills),
        certifications=_load_json(r.certifications),
        section_order=_load_json(r.section_order),
        ats_score=r.ats_score,
        jd_text=r.jd_text,
        created_at=str(r.created_at) if r.created_at else "",
        updated_at=str(r.updated_at) if r.updated_at else "",
    )


def _to_plain_dict(r: Resume) -> dict[str, Any]:
    """Serialise a Resume row into a plain dict for the ATS scorer."""
    resp = _to_response(r)
    return resp.model_dump()


def _apply_json_fields(target: Resume, data: dict[str, Any]) -> None:
    """Set JSON-encoded TEXT columns from Python objects."""
    for key, value in data.items():
        if key in JSON_FIELDS and value is not None:
            setattr(target, key, json.dumps(value, default=str))
        elif value is not None:
            setattr(target, key, value)


def _get_owned_resume(resume_id: int, user_id: int, db: Session) -> Resume:
    """Fetch a resume by id and verify ownership, raising 404 if missing."""
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user_id)
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    return resume


def _maybe_recalculate_ats(resume: Resume) -> None:
    """Recompute the ATS score in the background after a data change.

    This is called synchronously inside the same transaction so the score
    is always fresh when the client reads the resume.  Errors are logged
    but never raised — a missing score is acceptable.
    """
    try:
        from app.services.ats_scorer import score_resume

        data = _to_plain_dict(resume)
        result = score_resume(data)
        resume.ats_score = result["score"]
    except Exception:
        # Scorer failure must not block the CRUD operation
        pass


# ---------------------------------------------------------------------------
# CRUD operations
# ---------------------------------------------------------------------------


def create_resume(user_id: int, data: ResumeCreate, db: Session) -> ResumeResponse:
    """Create a new blank resume for the given user."""
    resume = Resume(user_id=user_id)
    _apply_json_fields(resume, data.model_dump(exclude_unset=True))
    db.add(resume)
    db.commit()
    db.refresh(resume)
    _maybe_recalculate_ats(resume)
    db.commit()
    db.refresh(resume)
    return _to_response(resume)


def get_resume(resume_id: int, user_id: int, db: Session) -> ResumeResponse:
    """Return a single resume after verifying ownership."""
    resume = _get_owned_resume(resume_id, user_id, db)
    return _to_response(resume)


def list_resumes(
    user_id: int,
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
) -> dict[str, Any]:
    """Return a paginated list of the user's resumes."""
    query = db.query(Resume).filter(Resume.user_id == user_id)
    total = query.count()
    total_pages = max(1, math.ceil(total / page_size))

    resumes = (
        query.order_by(Resume.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": [_to_response(r) for r in resumes],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def update_resume_full(
    resume_id: int, user_id: int, data: ResumeFullUpdate, db: Session
) -> ResumeResponse:
    """PUT — full replacement of all resume fields."""
    resume = _get_owned_resume(resume_id, user_id, db)

    update_dict = data.model_dump()
    _apply_json_fields(resume, update_dict)

    _maybe_recalculate_ats(resume)
    db.commit()
    db.refresh(resume)
    return _to_response(resume)


def update_resume_partial(
    resume_id: int, user_id: int, data: ResumeUpdate, db: Session
) -> ResumeResponse:
    """PATCH — partial update (used by auto-save). Only provided fields are
    written."""
    resume = _get_owned_resume(resume_id, user_id, db)

    update_dict = data.model_dump(exclude_unset=True)
    _apply_json_fields(resume, update_dict)

    _maybe_recalculate_ats(resume)
    db.commit()
    db.refresh(resume)
    return _to_response(resume)


def delete_resume(resume_id: int, user_id: int, db: Session) -> None:
    """Delete a resume after verifying ownership. Raises 404 if not found."""
    resume = _get_owned_resume(resume_id, user_id, db)
    db.delete(resume)
    db.commit()


def duplicate_resume(resume_id: int, user_id: int, db: Session) -> ResumeResponse:
    """Create an exact copy of an existing resume with a new id."""
    original = _get_owned_resume(resume_id, user_id, db)

    copy = Resume(
        user_id=user_id,
        full_name=original.full_name,
        email=original.email,
        phone=original.phone,
        location=original.location,
        linkedin_url=original.linkedin_url,
        summary=original.summary,
        education=original.education,
        experience=original.experience,
        projects=original.projects,
        skills=original.skills,
        certifications=original.certifications,
        section_order=original.section_order,
        ats_score=None,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    _maybe_recalculate_ats(copy)
    db.commit()
    db.refresh(copy)
    return _to_response(copy)


def tailor_resume(
    resume_id: int, user_id: int, jd_text: str, db: Session
) -> ResumeResponse:
    """Fork a resume for a specific job: duplicate it with the JD attached.

    The original stays untouched (the student's "master" resume); the copy
    carries ``jd_text`` so the builder can re-score against the same job on
    every visit.
    """
    copy = duplicate_resume(resume_id, user_id, db)
    row = _get_owned_resume(copy.id, user_id, db)
    row.jd_text = jd_text.strip()
    db.commit()
    db.refresh(row)
    return _to_response(row)


# ---------------------------------------------------------------------------
# PDF generation & ATS scoring
# ---------------------------------------------------------------------------


def generate_resume_pdf(
    resume_id: int, user_id: int, db: Session, *, template: str = "classic"
) -> str:
    """Generate a PDF for the given resume and return the file path."""
    import os

    from app.core.config import settings
    from app.modules.resumes.pdf_generator import generate_pdf

    resume = _get_owned_resume(resume_id, user_id, db)
    data = _to_response(resume)
    pdf_bytes = generate_pdf(data.model_dump(), template=template)

    os.makedirs(f"{settings.STORAGE_DIR}/resumes", exist_ok=True)
    pdf_path = f"{settings.STORAGE_DIR}/resumes/{resume_id}.pdf"
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    return pdf_path


def download_resume_pdf(
    resume_id: int, user_id: int, db: Session, *, template: str = "classic"
) -> tuple[bytes, str]:
    """Generate raw PDF bytes for download without persisting.

    Returns ``(pdf_bytes, filename)`` — the filename follows recruiter-friendly
    hygiene: ``FirstName_LastName_Resume.pdf`` (falls back to ``Resume.pdf``).
    """
    from app.modules.resumes.pdf_generator import generate_pdf

    resume = _get_owned_resume(resume_id, user_id, db)
    data = _to_response(resume)
    pdf_bytes = generate_pdf(data.model_dump(), template=template)
    return pdf_bytes, make_resume_filename(resume.full_name or "")


def make_resume_filename(full_name: str) -> str:
    """Build an ATS/recruiter-friendly file name from the candidate's name."""
    import re as _re

    clean = _re.sub(r"[^A-Za-z0-9 ]+", "", full_name).strip()
    if not clean:
        return "Resume.pdf"
    return "_".join(w.capitalize() for w in clean.split()) + "_Resume.pdf"


def get_ats_preview(
    resume_id: int, user_id: int, db: Session, *, template: str = "classic"
) -> dict[str, Any]:
    """Render the resume PDF and extract its plain text — the ATS's-eye view.

    Runs the same extraction pipeline used for uploaded resumes on our own
    generated PDF, so the student sees exactly what a parser would read
    (and section detection proves the headers survive parsing).
    """
    from app.modules.resumes.pdf_generator import generate_pdf
    from app.services.resume_parser import extract_text_pdf, split_sections

    resume = _get_owned_resume(resume_id, user_id, db)
    data = _to_response(resume)
    pdf_bytes = generate_pdf(data.model_dump(), template=template)

    text, used_ocr = extract_text_pdf(pdf_bytes)
    sections = split_sections(text)
    detected = [s for s in sections if s != "header"]

    warnings: list[str] = []
    if used_ocr:
        warnings.append(
            "The PDF had no text layer and needed OCR — an ATS would likely "
            "fail to parse it. This should never happen with our templates; "
            "please report it."
        )
    if not text.strip():
        warnings.append("No text could be extracted — the PDF appears to be an image.")
    expected = {"experience", "education", "skills"}
    missing = [
        s for s in expected
        if s not in detected and (getattr(data, s, None) or [])
    ]
    for s in missing:
        warnings.append(
            f"Your {s.title()} section exists but wasn't detected in the "
            "extracted text — an ATS may miss it."
        )

    return {"text": text, "detected_sections": detected, "warnings": warnings}


def get_resume_score(
    resume_id: int,
    user_id: int,
    db: Session,
    *,
    role: str | None = None,
    jd_text: str | None = None,
) -> dict:
    """Compute the full ATS score for a resume and persist it."""
    from app.services.ats_scorer import score_resume

    resume = _get_owned_resume(resume_id, user_id, db)
    data = _to_plain_dict(resume)
    result = score_resume(data, role=role, jd_text=jd_text)

    resume.ats_score = result["score"]
    db.commit()

    return result
