import csv
import re
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/aptitude", tags=["aptitude"])

DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "aptitude_processed"


def _slugify(name: str) -> str:
    name = re.sub(r"\.csv$", "", name)
    name = re.sub(r"^\d+\s*", "", name).strip()
    return re.sub(r"[^a-zA-Z0-9]+", "-", name).lower().strip("-")


def _read_csv(filepath: Path):
    with open(filepath, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


@router.get("/categories")
def list_categories():
    if not DATA_DIR.exists():
        return []
    files = sorted(DATA_DIR.glob("*.csv"))
    categories = []
    for f in files:
        rows = _read_csv(f)
        levels = sorted({r.get("Level", "") for r in rows if r.get("Level")})
        categories.append({
            "name": re.sub(r"\.csv$", "", f.name),
            "slug": _slugify(f.name),
            "question_count": len(rows),
            "levels": levels,
        })
    return categories


@router.get("/categories/{category_slug}/questions")
def get_questions(
    category_slug: str,
    level: str = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    files = sorted(DATA_DIR.glob("*.csv"))
    target_file = None
    for f in files:
        if _slugify(f.name) == category_slug:
            target_file = f
            break

    if not target_file:
        return {"items": [], "total": 0, "limit": limit, "offset": offset}

    rows = _read_csv(target_file)

    if level:
        rows = [r for r in rows if r.get("Level", "").lower() == level.lower()]

    total = len(rows)
    items = rows[offset: offset + limit]

    return {"items": items, "total": total, "limit": limit, "offset": offset}
