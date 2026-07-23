import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import settings
from app.db.session import get_db_session
from app.modules.jobs.models import JobSearchCache
from app.modules.jobs.schemas import (
    JobCategory,
    JobCompany,
    JobListing,
    JobLocation,
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


DEFAULT_COUNTRY = "in"
DEFAULT_PAGE = 1
DEFAULT_RESULTS_PER_PAGE = 20


def _normalize_query_key(
    role: str,
    location: str,
    country: str,
    page: int,
    results_per_page: int,
    salary_min: int | None,
    full_time: bool | None,
    permanent: bool | None,
    sort_by: str,
) -> str:
    role_norm = role.strip().lower()
    location_norm = location.strip().lower()
    country_norm = country.strip().lower()
    sort_norm = sort_by.strip().lower()
    return (
        f"{role_norm}|{location_norm}|{country_norm}|{page}|{results_per_page}|"
        f"{salary_min if salary_min is not None else ''}|{full_time if full_time is not None else ''}|"
        f"{permanent if permanent is not None else ''}|{sort_norm}"
    )


def _build_search_combos(
    roles: list[str],
    locations: list[str] | None,
) -> list[tuple[str, str]]:
    if not locations:
        return [(role, "") for role in roles]
    return [(role, location) for role in roles for location in locations]


async def _get_cached_results(
    db: AsyncSession, query_key: str
) -> JobSearchCache | None:
    stmt = select(JobSearchCache).where(JobSearchCache.query_key == query_key)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _upsert_cache(
    db: AsyncSession,
    query_key: str,
    role: str,
    location: str,
    results: dict[str, Any],
) -> None:
    ttl_hours = settings.JOB_SEARCH_CACHE_TTL_HOURS
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=ttl_hours)

    stmt = pg_insert(JobSearchCache).values(
        query_key=query_key,
        role=role,
        location=location,
        results=results,
        fetched_at=now,
        expires_at=expires_at,
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=["query_key"],
        set_={
            "role": role,
            "location": location,
            "results": results,
            "fetched_at": now,
            "expires_at": expires_at,
        },
    )
    await db.execute(stmt)
    await db.commit()


async def _call_adzuna_api(
    role: str,
    location: str,
    country: str,
    page: int,
    results_per_page: int,
    salary_min: int | None,
    full_time: bool | None,
    permanent: bool | None,
    sort_by: str,
) -> dict[str, Any]:
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        raise ValueError(
            "Adzuna API credentials are not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env"
        )

    url = f"{ADZUNA_BASE_URL}/{country}/search/{page}"

    params: dict[str, Any] = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": results_per_page,
        "what": role,
        "content-type": "application/json",
    }

    if location:
        params["where"] = location
    if salary_min is not None:
        params["salary_min"] = salary_min
    if full_time is not None:
        params["full_time"] = int(full_time)
    if permanent is not None:
        params["permanent"] = int(permanent)
    if sort_by:
        params["sort_by"] = sort_by

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        return resp.json()


MAX_AGE_MONTHS = 2
MAX_AGE_CUTOFF = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_MONTHS * 30)


def _is_too_old(created: Any) -> bool:
    if created is None:
        return False
    try:
        if isinstance(created, (int, float)):
            posted = datetime.fromtimestamp(created, tz=timezone.utc)
        elif isinstance(created, str):
            posted = datetime.fromisoformat(created.replace("Z", "+00:00"))
        else:
            return False
        return posted < MAX_AGE_CUTOFF
    except (TypeError, ValueError, OSError):
        return False


def _transform_adzuna_results(raw_data: dict[str, Any], page: int, results_per_page: int) -> JobSearchResponse:
    raw_results = raw_data.get("results", [])

    listings: list[JobListing] = []
    for r in raw_results:
        if _is_too_old(r.get("created")):
            continue

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
                )
                if cat_data
                else None,
                redirect_url=r.get("redirect_url", ""),
                created=r.get("created", ""),
            )
        )

    return JobSearchResponse(
        results=listings,
        count=raw_data.get("count", len(listings)),
        page=raw_data.get("page", page),
        results_per_page=raw_data.get("results_per_page", results_per_page),
    )


def _get_created_ts(created: Any) -> float:
    """Return a sortable timestamp from a job's created field."""
    if created is None:
        return 0.0
    try:
        if isinstance(created, (int, float)):
            return float(created)
        if isinstance(created, str):
            return datetime.fromisoformat(created.replace("Z", "+00:00")).timestamp()
    except (TypeError, ValueError, OSError):
        pass
    return 0.0


async def search_jobs(
    roles: list[str],
    locations: list[str] | None,
    country: str = DEFAULT_COUNTRY,
    page: int = DEFAULT_PAGE,
    results_per_page: int = DEFAULT_RESULTS_PER_PAGE,
    salary_min: int | None = None,
    full_time: bool | None = None,
    permanent: bool | None = None,
    sort_by: str = "relevance",
) -> JobSearchResponse:
    combos = _build_search_combos(roles, locations)
    if not combos:
        raise ValueError("At least one search title is required.")

    fetch_count = page * results_per_page
    async for db in get_db_session():
        now = datetime.now(timezone.utc)
        unique_results: dict[str, JobListing] = {}

        for role, location in combos:
            query_key = _normalize_query_key(
                role,
                location,
                country,
                1,
                fetch_count,
                salary_min,
                full_time,
                permanent,
                sort_by,
            )
            cached = await _get_cached_results(db, query_key)
            if cached and cached.expires_at.replace(tzinfo=None) > now.replace(tzinfo=None):
                logger.info(f"Cache hit for query_key: {query_key}")
                raw_data = cached.results
            else:
                raw_data = await _call_adzuna_api(
                    role,
                    location,
                    country,
                    1,
                    fetch_count,
                    salary_min,
                    full_time,
                    permanent,
                    sort_by,
                )
                await _upsert_cache(
                    db,
                    query_key,
                    role,
                    location,
                    raw_data,
                )
            transformed = _transform_adzuna_results(raw_data, 1, fetch_count)
            for listing in transformed.results:
                unique_results.setdefault(listing.id, listing)

        combined_listings = list(unique_results.values())
        combined_listings.sort(key=lambda j: _get_created_ts(j.created), reverse=True)

        start = (page - 1) * results_per_page
        end = page * results_per_page
        page_results = combined_listings[start:end]

        return JobSearchResponse(
            results=page_results,
            count=len(combined_listings),
            page=page,
            results_per_page=results_per_page,
        )