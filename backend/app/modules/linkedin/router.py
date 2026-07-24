"""LinkedIn profile analysis API endpoints.

All routes require JWT authentication.
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.db.session import get_db
from app.modules.linkedin import service
from app.shared.schemas import ApiResponse

router = APIRouter(prefix="/linkedin", tags=["linkedin"])


# ---------------------------------------------------------------------------
# POST /linkedin/parse-upload — Parse a LinkedIn PDF export
# ---------------------------------------------------------------------------


@router.post("/parse-upload")
async def parse_upload(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Parse an uploaded LinkedIn PDF export and store the analysis.

    Extracts raw text, splits into sections (headline, about, experience,
    education, skills), and persists the structured result.
    """
    from app.services.linkedin_parser import MAX_FILE_SIZE, parse_linkedin_pdf

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5 MB.")

    try:
        result = parse_linkedin_pdf(data, file.filename or "")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    # Persist the analysis
    analysis = service.create_analysis(
        user_id=user_id,
        raw_text=result["raw_text"],
        sections=result["sections"],
        detected_sections=result["detected_sections"],
        warnings=result["warnings"],
        db=db,
    )

    return ApiResponse(
        success=True,
        data=service._to_response_dict(analysis),
        message="LinkedIn profile parsed and stored",
    )


# ---------------------------------------------------------------------------
# GET /linkedin — List all analyses
# ---------------------------------------------------------------------------


@router.get("")
def list_analyses(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return all LinkedIn analyses for the authenticated user."""
    analyses = service.list_analyses(user_id, db)
    return ApiResponse(success=True, data=analyses, message="Analyses fetched")


# ---------------------------------------------------------------------------
# GET /linkedin/roles — List available roles for scoring
# ---------------------------------------------------------------------------


@router.get("/roles")
def list_roles():
    """Return all available roles for LinkedIn profile scoring."""
    from app.services.linkedin_scorer import get_all_role_keys, _load_taxonomy

    tax = _load_taxonomy()
    roles = []
    for key in get_all_role_keys():
        entry = tax.get("roles", {}).get(key, {})
        roles.append({
            "key": key,
            "name": entry.get("name", key),
        })
    return ApiResponse(success=True, data={"roles": roles}, message="Roles fetched")


# ---------------------------------------------------------------------------
# POST /linkedin/{analysis_id}/score — Score a LinkedIn analysis
# ---------------------------------------------------------------------------


class _ScoreBody(BaseModel):
    role: str | None = None


@router.post("/{analysis_id}/score")
def score_analysis(
    analysis_id: int,
    body: _ScoreBody = _ScoreBody(),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Compute the LinkedIn profile score across four categories.

    Optionally pass ``{"role": "sde"}`` for role-specific scoring.
    """
    from app.services.linkedin_scorer import get_all_role_keys, score_linkedin

    try:
        analysis = service.get_analysis(analysis_id, user_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    role = body.role
    if role:
        role = role.lower().replace("-", "_").replace(" ", "_")
        if role not in get_all_role_keys():
            return ApiResponse(
                success=False,
                data=None,
                message=f"Unknown role '{body.role}'. Use GET /linkedin/roles to list valid roles.",
            )

    sections = service._get_sections(analysis)
    result = score_linkedin(sections, role=role)

    # Persist scores
    service.persist_scores(analysis, result, db)

    return ApiResponse(success=True, data=result, message="Score computed")


# ---------------------------------------------------------------------------
# POST /linkedin/{analysis_id}/rewrite-headline — LLM headline rewrite
# ---------------------------------------------------------------------------


class _RewriteBody(BaseModel):
    role: str | None = None


@router.post("/{analysis_id}/rewrite-headline")
def rewrite_headline(
    analysis_id: int,
    body: _RewriteBody = _RewriteBody(),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate an improved headline using Ollama.

    Rate-limited to one request per 30 seconds per user.
    The rewritten headline is persisted in the scores JSON.
    """
    from app.services.linkedin_rewriter import (
        OllamaError,
        check_rate_limit,
        mark_used,
        rewrite_headline as do_rewrite,
    )

    # Rate limit
    rl_msg = check_rate_limit(user_id, "headline")
    if rl_msg:
        raise HTTPException(status_code=429, detail=rl_msg)

    try:
        analysis = service.get_analysis(analysis_id, user_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    sections = service._get_sections(analysis)
    current_headline = sections.get("headline", "")
    if not current_headline.strip():
        raise HTTPException(status_code=422, detail="No headline found in the parsed profile.")

    try:
        rewritten = do_rewrite(current_headline, target_role=body.role)
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    mark_used(user_id, "headline")
    service.persist_rewrite(analysis, "headline", current_headline, rewritten, db)

    return ApiResponse(
        success=True,
        data={"original": current_headline, "rewritten": rewritten, "rewrite_type": "headline"},
        message="Headline rewritten",
    )


# ---------------------------------------------------------------------------
# POST /linkedin/{analysis_id}/rewrite-about — LLM About section rewrite
# ---------------------------------------------------------------------------


@router.post("/{analysis_id}/rewrite-about")
def rewrite_about(
    analysis_id: int,
    body: _RewriteBody = _RewriteBody(),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Generate an improved About section using Ollama.

    Rate-limited to one request per 30 seconds per user.
    The rewritten About is persisted in the scores JSON.
    """
    from app.services.linkedin_rewriter import (
        OllamaError,
        check_rate_limit,
        mark_used,
        rewrite_about as do_rewrite,
    )

    rl_msg = check_rate_limit(user_id, "about")
    if rl_msg:
        raise HTTPException(status_code=429, detail=rl_msg)

    try:
        analysis = service.get_analysis(analysis_id, user_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    sections = service._get_sections(analysis)
    current_about = sections.get("about", "")
    if not current_about.strip():
        raise HTTPException(status_code=422, detail="No About section found in the parsed profile.")

    try:
        rewritten = do_rewrite(current_about, target_role=body.role)
    except OllamaError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    mark_used(user_id, "about")
    service.persist_rewrite(analysis, "about", current_about, rewritten, db)

    return ApiResponse(
        success=True,
        data={"original": current_about, "rewritten": rewritten, "rewrite_type": "about"},
        message="About section rewritten",
    )


# ---------------------------------------------------------------------------
# GET /linkedin/{analysis_id} — Get a specific analysis
# ---------------------------------------------------------------------------


@router.get("/{analysis_id}")
def get_analysis(
    analysis_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Return a single analysis after verifying ownership."""
    try:
        analysis = service.get_analysis(analysis_id, user_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return ApiResponse(
        success=True,
        data=service._to_response_dict(analysis),
        message="Analysis fetched",
    )


# ---------------------------------------------------------------------------
# DELETE /linkedin/{analysis_id} — Delete an analysis
# ---------------------------------------------------------------------------


@router.delete("/{analysis_id}", status_code=200)
def delete_analysis(
    analysis_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Permanently delete an analysis after verifying ownership."""
    try:
        service.delete_analysis(analysis_id, user_id, db)
    except ValueError:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return ApiResponse(success=True, data=None, message="Analysis deleted")
