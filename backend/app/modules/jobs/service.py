import logging

import httpx

from app.core.config import settings
from app.modules.jobs.schemas import (
    JobCategory,
    JobCompany,
    JobListing,
    JobLocation,
    JobSearchRequest,
    JobSearchResponse,
)

logger = logging.getLogger(__name__)

ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs"

SUPPORTED_COUNTRIES = [
    ("in", "India"),
    ("gb", "United Kingdom"),
    ("us", "United States"),
    ("de", "Germany"),
    ("fr", "France"),
    ("br", "Brazil"),
    ("ca", "Canada"),
    ("au", "Australia"),
]


async def search_jobs(req: JobSearchRequest) -> JobSearchResponse:
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        raise ValueError("Adzuna API credentials are not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env")

    url = f"{ADZUNA_BASE_URL}/{req.country}/search/{req.page}"

    params: dict = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": req.results_per_page,
        "what": req.what,
        "content-type": "application/json",
    }

    if req.where:
        params["where"] = req.where
    if req.salary_min is not None:
        params["salary_min"] = req.salary_min
    if req.full_time is not None:
        params["full_time"] = 1 if req.full_time else 0
    if req.permanent is not None:
        params["permanent"] = 1 if req.permanent else 0
    if req.sort_by and req.sort_by != "relevance":
        params["sort_by"] = req.sort_by

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    raw_results = data.get("results", [])

    listings: list[JobListing] = []
    for r in raw_results:
        loc_data = r.get("location", {})
        cat_data = r.get("category", {})
        comp_data = r.get("company", {})

        listings.append(
            JobListing(
                id=str(r.get("id", "")),
                title=r.get("title", ""),
                company=JobCompany(display_name=comp_data.get("display_name", "")),
                location=JobLocation(
                    display_name=loc_data.get("display_name", ""),
                    area=loc_data.get("area", []),
                ),
                description=r.get("description", ""),
                salary_min=r.get("salary_min"),
                salary_max=r.get("salary_max"),
                contract_type=r.get("contract_type"),
                contract_time=r.get("contract_time"),
                category=JobCategory(
                    label=cat_data.get("label", ""),
                    tag=cat_data.get("tag", ""),
                ) if cat_data else None,
                redirect_url=r.get("redirect_url", ""),
                created=r.get("created", ""),
            )
        )

    return JobSearchResponse(
        results=listings,
        count=data.get("count", len(listings)),
        page=req.page,
        results_per_page=req.results_per_page,
    )
