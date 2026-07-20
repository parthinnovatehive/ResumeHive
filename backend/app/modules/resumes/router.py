"""Resume CRUD API endpoints.

All routes require JWT authentication.  Users can only access their own
resumes — every query is scoped by ``user_id`` extracted from the token.
"""

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.modules.resumes.schemas import (
    AnalyzeBulletsRequest,
    ResumeCreate,
    ResumeFullUpdate,
    ResumeUpdate,
    ScoreRequest,
    TailorRequest,
)
from app.modules.resumes import service
from app.shared.schemas import ApiResponse

router = APIRouter(prefix="/resumes", tags=["resumes"])


# ---------------------------------------------------------------------------
# POST /resumes — Create a new resume
# ---------------------------------------------------------------------------


@router.post("", status_code=201)
def create(
    data: ResumeCreate = ResumeCreate(),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new blank resume for the authenticated user.

    An optional JSON body pre-populates fields; omit it for a fully blank
    resume.
    """
    result = service.create_resume(user_id, data, db)
    return ApiResponse(success=True, data=result, message="Resume created")


# ---------------------------------------------------------------------------
# GET /resumes — List all resumes (paginated)
# ---------------------------------------------------------------------------


@router.get("")
def list_(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return a paginated list of resumes belonging to the authenticated user."""
    paginated = service.list_resumes(user_id, db, page=page, page_size=page_size)
    return ApiResponse(success=True, data=paginated, message="Resumes fetched")


# ---------------------------------------------------------------------------
# POST /resumes/analyze-bullets — Per-bullet quality feedback (inline editor)
# ---------------------------------------------------------------------------


@router.post("/analyze-bullets")
def analyze_bullets(
    body: AnalyzeBulletsRequest,
    user_id: int = Depends(get_current_user_id),
):
    """Analyze a description blob bullet-by-bullet.

    Returns per-line checks (quantification, action verb, passive voice)
    with specific fix messages — used for inline flagging in the editor
    while the student types. Stateless: nothing is persisted.
    """
    from app.services.bullet_analyzer import analyze_description

    result = analyze_description(body.text)
    return ApiResponse(success=True, data=result, message="Bullets analyzed")


# ---------------------------------------------------------------------------
# POST /resumes/parse-upload — Parse an uploaded resume file (Phase 3)
# ---------------------------------------------------------------------------


@router.post("/parse-upload")
async def parse_upload(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
):
    """Parse an uploaded PDF/DOCX resume into pre-fill form data.

    Stateless: nothing is persisted — the frontend receives the extracted
    fields plus a per-field confidence map ("high" = green, "low" = verify)
    and populates the builder form with them.
    """
    from app.services.resume_parser import MAX_FILE_SIZE, parse_resume

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    try:
        result = parse_resume(data, file.filename or "")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return ApiResponse(success=True, data=result, message="Resume parsed")


# ---------------------------------------------------------------------------
# GET /resumes/{resume_id} — Get a specific resume
# ---------------------------------------------------------------------------


@router.get("/{resume_id}")
def get(
    resume_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return a single resume after verifying ownership."""
    result = service.get_resume(resume_id, user_id, db)
    return ApiResponse(success=True, data=result, message="Resume fetched")


# ---------------------------------------------------------------------------
# PUT /resumes/{resume_id} — Full replacement update
# ---------------------------------------------------------------------------


@router.put("/{resume_id}")
def update_full(
    resume_id: int,
    data: ResumeFullUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Replace the entire resume content. All content fields must be provided."""
    result = service.update_resume_full(resume_id, user_id, data, db)
    return ApiResponse(success=True, data=result, message="Resume updated")


# ---------------------------------------------------------------------------
# PATCH /resumes/{resume_id} — Partial update (auto-save)
# ---------------------------------------------------------------------------


@router.patch("/{resume_id}")
def update_partial(
    resume_id: int,
    data: ResumeUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Partial update — only fields present in the request body are changed.
    Ideal for auto-save / debounced saves from the frontend.
    """
    result = service.update_resume_partial(resume_id, user_id, data, db)
    return ApiResponse(success=True, data=result, message="Resume updated")


# ---------------------------------------------------------------------------
# DELETE /resumes/{resume_id} — Delete a resume
# ---------------------------------------------------------------------------


@router.delete("/{resume_id}", status_code=200)
def delete(
    resume_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Permanently delete a resume after verifying ownership."""
    service.delete_resume(resume_id, user_id, db)
    return ApiResponse(success=True, data=None, message="Resume deleted")


# ---------------------------------------------------------------------------
# POST /resumes/{resume_id}/duplicate — Clone a resume
# ---------------------------------------------------------------------------


@router.post("/{resume_id}/duplicate", status_code=201)
def duplicate(
    resume_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create an exact copy of an existing resume with a new id."""
    result = service.duplicate_resume(resume_id, user_id, db)
    return ApiResponse(success=True, data=result, message="Resume duplicated")


# ---------------------------------------------------------------------------
# POST /resumes/{resume_id}/generate — Generate PDF
# ---------------------------------------------------------------------------

VALID_TEMPLATES = {"classic", "modern", "minimal", "professional", "compact"}


@router.post("/{resume_id}/generate", status_code=200)
def generate(
    resume_id: int,
    template: str = Query("classic", description="Template name"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate a PDF for the resume and return its storage path."""
    tpl = template.lower().strip()
    if tpl not in VALID_TEMPLATES:
        tpl = "classic"
    path = service.generate_resume_pdf(resume_id, user_id, db, template=tpl)
    return ApiResponse(success=True, data={"pdf_path": path}, message="PDF generated")


# ---------------------------------------------------------------------------
# GET /resumes/{resume_id}/download — Download PDF as file
# ---------------------------------------------------------------------------


@router.get("/{resume_id}/download")
def download(
    resume_id: int,
    template: str = Query("classic", description="Template name"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate and stream the resume PDF as a file download.

    The filename follows recruiter hygiene: ``FirstName_LastName_Resume.pdf``.
    """
    tpl = template.lower().strip()
    if tpl not in VALID_TEMPLATES:
        tpl = "classic"
    pdf_bytes, filename = service.download_resume_pdf(resume_id, user_id, db, template=tpl)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# GET /resumes/{resume_id}/ats-preview — What an ATS parser actually sees
# ---------------------------------------------------------------------------


@router.get("/{resume_id}/ats-preview")
def ats_preview(
    resume_id: int,
    template: str = Query("classic", description="Template name"),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Render the resume PDF and return the plain text an ATS would extract.

    More convincing than a numeric score alone: the student literally sees
    the text dump, plus which sections survived parsing.
    """
    tpl = template.lower().strip()
    if tpl not in VALID_TEMPLATES:
        tpl = "classic"
    result = service.get_ats_preview(resume_id, user_id, db, template=tpl)
    return ApiResponse(success=True, data=result, message="ATS preview generated")


# ---------------------------------------------------------------------------
# POST /resumes/{resume_id}/tailor — Fork a resume for a specific job (Phase 4)
# ---------------------------------------------------------------------------


@router.post("/{resume_id}/tailor", status_code=201)
def tailor(
    resume_id: int,
    body: TailorRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Duplicate a resume with a job description attached.

    The original stays untouched as the student's master resume; the copy
    remembers the JD so it can be re-scored against the same job later.
    """
    if not body.jd_text.strip():
        raise HTTPException(status_code=422, detail="jd_text must not be empty")
    result = service.tailor_resume(resume_id, user_id, body.jd_text, db)
    return ApiResponse(success=True, data=result, message="Tailored copy created")


# ---------------------------------------------------------------------------
# GET /resumes/{resume_id}/score — ATS score (with optional role targeting)
# ---------------------------------------------------------------------------

VALID_ROLES = {
    "sde", "data_analyst", "product_manager", "devops",
    "frontend", "data_scientist",
}


@router.get("/{resume_id}/score")
def score(
    resume_id: int,
    role: str | None = Query(
        None,
        description="Target role for keyword matching (e.g. sde, data_analyst).",
    ),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Compute the full ATS score with per-category breakdown and suggestions.

    Pass ``?role=sde`` (or data_analyst, product_manager, devops, frontend,
    data_scientist) to score against role-specific keywords.  Omit for a
    generic software-engineering keyword set.
    """
    if role and role.lower().replace("-", "_").replace(" ", "_") not in VALID_ROLES:
        return ApiResponse(
            success=False,
            data=None,
            message=(
                f"Unknown role '{role}'. Valid roles: {', '.join(sorted(VALID_ROLES))}"
            ),
        )

    result = service.get_resume_score(
        resume_id, user_id, db,
        role=role.lower().replace("-", "_").replace(" ", "_") if role else None,
    )
    return ApiResponse(success=True, data=result, message="ATS score computed")


# ---------------------------------------------------------------------------
# POST /resumes/{resume_id}/score — ATS score with pasted JD text (Phase 4)
# ---------------------------------------------------------------------------


@router.post("/{resume_id}/score")
def score_with_jd(
    resume_id: int,
    body: ScoreRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Compute the ATS score, optionally matched against a job description.

    Accepts a JSON body (``role``, ``jd_text``) since JD text is far too
    long for a query string.  When ``jd_text`` is provided the result
    gains a ``jd_match`` category (25 pts) with matched/missing keywords,
    and the six base categories are scaled to share the remaining 75.
    """
    role = body.role
    if role:
        role = role.lower().replace("-", "_").replace(" ", "_")
        if role not in VALID_ROLES:
            return ApiResponse(
                success=False,
                data=None,
                message=(
                    f"Unknown role '{body.role}'. Valid roles: {', '.join(sorted(VALID_ROLES))}"
                ),
            )

    result = service.get_resume_score(
        resume_id, user_id, db, role=role, jd_text=body.jd_text,
    )
    return ApiResponse(success=True, data=result, message="ATS score computed")


# ---------------------------------------------------------------------------
# POST /resumes/{resume_id}/gap-analysis — Gap analysis for target role
# ---------------------------------------------------------------------------

VALID_GAP_ROLES = {
    "sde", "frontend", "backend", "fullstack", "mobile", "embedded", "game_dev",
    "blockchain", "web3_developer", "iot_engineer", "robotics_engineer",
    "cuda_engineer", "data_analyst", "data_scientist", "data_engineer",
    "data_architect", "mlops", "ml_engineer", "ai_engineer", "ai_researcher",
    "nlp_engineer", "recommendation_engineer", "bioinformatics",
    "quantitative_analyst", "devops", "cloud", "cloud_native",
    "site_reliability", "platform_engineer", "terraform_engineer",
    "observability_engineer", "release_engineer", "integration_engineer",
    "apm_engineer", "security", "penetration_tester", "eth_hacker",
    "ux_designer", "animation", "content_creator", "product_manager",
    "technical_lead", "solutions_architect", "scrum_master", "consultant",
    "qa_engineer", "automation_engineer", "database_admin", "network_engineer",
    "systems_admin", "it_support", "analytics_engineer", "growth_engineer",
    "search_engineer", "simulation_engineer", "geospatial_engineer",
    "billing_engineer", "visualization_engineer",
    "technical_writer", "operations_manager", "finance_analyst",
    "marketing_manager", "hr_specialist", "sales_engineer",
}


class _GapBody(BaseModel):
    target_role: str
    target_company: str | None = None


@router.post("/{resume_id}/gap-analysis")
def gap_analysis(
    resume_id: int,
    body: _GapBody,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Compare a resume against a target role and identify gaps."""
    from app.services.gap_analyzer import analyze_resume

    role_key = body.target_role.lower().replace(" ", "_").replace("-", "_")
    if role_key not in VALID_GAP_ROLES:
        return ApiResponse(
            success=False,
            data=None,
            message=f"Unknown role '{body.target_role}'. Use GET /resumes/gap-roles to list valid roles.",
        )

    resume = service._get_owned_resume(resume_id, user_id, db)
    data = service._to_plain_dict(resume)
    result = analyze_resume(data, role_key)
    return ApiResponse(success=True, data=result, message="Gap analysis complete")


# ---------------------------------------------------------------------------
# GET /resumes/gap-roles — List available roles for gap analysis
# ---------------------------------------------------------------------------


@router.get("/gap-roles")
def list_gap_roles():
    """Return the full list of roles available for gap analysis."""
    from app.services.gap_analyzer import get_all_roles, get_role_categories

    return ApiResponse(
        success=True,
        data={"roles": get_all_roles(), "categories": get_role_categories()},
        message="Roles fetched",
    )
