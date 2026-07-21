import logging

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.config import Settings, settings
from app.core.security import get_current_user_id
from app.modules.jobs.schemas import (
    CountryOption,
    JobSearchRequest,
    JobSearchResponse,
)
from app.modules.jobs.service import SUPPORTED_COUNTRIES, search_jobs
from app.shared.schemas import ApiResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/search", response_model=ApiResponse[JobSearchResponse])
async def search_jobs_endpoint(
    what: str = Query(..., min_length=1, description="Job title or keywords"),
    where: str = Query(default="", description="Location filter"),
    country: str = Query(default="in", description="Country code"),
    page: int = Query(default=1, ge=1),
    results_per_page: int = Query(default=20, ge=1, le=50),
    salary_min: int | None = Query(default=None, ge=0),
    full_time: bool | None = Query(default=None),
    permanent: bool | None = Query(default=None),
    sort_by: str = Query(default="relevance", pattern="^(relevance|salary|date)$"),
    user_id: int = Depends(get_current_user_id),
):
    req = JobSearchRequest(
        what=what,
        where=where,
        country=country,
        page=page,
        results_per_page=results_per_page,
        salary_min=salary_min,
        full_time=full_time,
        permanent=permanent,
        sort_by=sort_by,
    )

    try:
        result = await search_jobs(req)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("Adzuna API error")
        raise HTTPException(status_code=502, detail=f"Failed to fetch jobs from Adzuna: {e}")

    return ApiResponse(
        success=True,
        data=result,
        message=f"Found {result.count} jobs",
    )


@router.get("/countries", response_model=ApiResponse[list[CountryOption]])
async def list_countries(user_id: int = Depends(get_current_user_id)):
    countries = [CountryOption(code=c, name=n) for c, n in SUPPORTED_COUNTRIES]
    return ApiResponse(
        success=True,
        data=countries,
        message=f"{len(countries)} countries available",
    )
