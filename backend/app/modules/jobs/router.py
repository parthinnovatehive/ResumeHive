import logging

from fastapi import APIRouter, Depends, HTTPException

from app.core.config import settings
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
    params: JobSearchRequest = Depends(),
    user_id: int = Depends(get_current_user_id),
):
    try:
        roles = [r.strip() for r in params.what.split(",") if r.strip()]
        locations = [l.strip() for l in params.where.split(",") if l.strip()] if params.where else None
        result = await search_jobs(
            roles=roles,
            locations=locations,
            country=params.country,
            page=params.page,
            results_per_page=params.results_per_page,
            salary_min=params.salary_min,
            full_time=params.full_time,
            permanent=params.permanent,
            sort_by=params.sort_by,
        )
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