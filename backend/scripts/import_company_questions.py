"""
Import company-specific LeetCode questions from CSV files into the database.

Walks backend/data/company_questions/, one subfolder per company.
CSVs are tab-separated (or comma-separated fallback) with columns:
    Difficulty    Title    Frequency    Acceptance Rate    Link    Topics(optional)

Idempotent — safe to re-run whenever source data is updated.
"""

import csv
import os
import re
import sys
import logging
from pathlib import Path

# Ensure the backend package is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import SessionLocal
from app.db.base import Base
from app.core.config import settings
from app.modules.practice.models import Company, CompanyQuestionStat, Question
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger("import_company_questions")

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "company_questions"

# Mapping from CSV filename (lowercase, stripped of leading number/prefix) to time_window string
FILENAME_PATTERNS = [
    (re.compile(r"^(?:\d+\.?\s*)?thirty\s*days.*\.csv$", re.I), "THIRTY_DAYS"),
    (re.compile(r"^(?:\d+\.?\s*)?three\s*months.*\.csv$", re.I), "THREE_MONTHS"),
    (re.compile(r"^(?:\d+\.?\s*)?six\s*months.*\.csv$", re.I), "SIX_MONTHS"),
    (re.compile(r"^(?:\d+\.?\s*)?more\s*than\s*six\s*months.*\.csv$", re.I), "MORE_THAN_SIX_MONTHS"),
    (re.compile(r"^(?:\d+\.?\s*)?all\.csv$", re.I), "ALL"),
]


def match_time_window(filename: str) -> str | None:
    for pattern, tw in FILENAME_PATTERNS:
        if pattern.match(filename.strip()):
            return tw
    return None


def detect_dialect(filepath: Path) -> str:
    """Detect tab vs comma separator by reading the header."""
    with open(filepath, encoding="utf-8") as f:
        header = f.readline()
    if "\t" in header:
        return "tab"
    return "comma"


def normalize_columns(row: dict) -> dict:
    """Normalize CSV row keys to canonical column names."""
    mapping = {}
    for k in row:
        k_stripped = k.strip()
        kl = k_stripped.lower()
        if kl == "difficulty":
            mapping[k] = "difficulty"
        elif kl == "title":
            mapping[k] = "title"
        elif kl == "frequency":
            mapping[k] = "frequency"
        elif kl in ("acceptance rate", "acceptance_rate"):
            mapping[k] = "acceptance_rate"
        elif kl == "link":
            mapping[k] = "link"
    return {mapping.get(k, k): v for k, v in row.items()}


def parse_csv(filepath: Path) -> list[dict]:
    """Parse a CSV file (tab or comma separated) and return list of normalized rows."""
    dialect = detect_dialect(filepath)
    rows = []
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t" if dialect == "tab" else ",")
        for row in reader:
            rows.append(normalize_columns(row))
    return rows


def slugify(name: str) -> str:
    return name.strip().lower().replace(" ", "-")


def run():
    if not DATA_DIR.exists():
        logger.error("Data directory not found: %s", DATA_DIR)
        sys.exit(1)

    # Ensure tables exist
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    company_folders = sorted(
        [d for d in DATA_DIR.iterdir() if d.is_dir() and not d.name.startswith(".")]
    )

    stats = {
        "companies": 0,
        "questions": 0,
        "stat_rows": 0,
        "errors": [],
        "missing_files": [],
    }

    try:
        for folder in company_folders:
            company_name = folder.name.strip()
            company_slug = slugify(company_name)

            company = db.query(Company).filter(Company.slug == company_slug).first()
            if not company:
                company = Company(name=company_name, slug=company_slug)
                db.add(company)
                db.flush()
                stats["companies"] += 1
            else:
                # Update name in case it changed casing
                company.name = company_name

            csv_files = sorted(f for f in folder.iterdir() if f.suffix.lower() == ".csv")
            processed_windows = set()

            for csv_file in csv_files:
                tw = match_time_window(csv_file.name)
                if not tw:
                    logger.warning("  Skipping unrecognized CSV: %s", csv_file.name)
                    continue

                processed_windows.add(tw)

                try:
                    rows = parse_csv(csv_file)
                except Exception as e:
                    msg = f"Failed to parse {csv_file.relative_to(DATA_DIR)}: {e}"
                    logger.error("  %s", msg)
                    stats["errors"].append(msg)
                    continue

                for row in rows:
                    try:
                        difficulty = row.get("difficulty", "").strip().upper()
                        if difficulty not in ("EASY", "MEDIUM", "HARD"):
                            logger.warning("    Skipping row with unknown difficulty '%s' in %s", difficulty, csv_file.name)
                            continue

                        title = row.get("title", "").strip()
                        link = row.get("link", "").strip()
                        if not link:
                            logger.warning("    Skipping row with no link in %s", csv_file.name)
                            continue

                        try:
                            frequency = float(row.get("frequency", 0))
                        except (ValueError, TypeError):
                            frequency = 0.0

                        try:
                            acceptance_rate = float(row.get("acceptance_rate", 0))
                        except (ValueError, TypeError):
                            acceptance_rate = 0.0

                        # Upsert Question
                        existing_q = db.query(Question).filter(Question.link == link).first()
                        if existing_q:
                            if (
                                existing_q.acceptance_rate != acceptance_rate
                                or existing_q.difficulty != difficulty
                            ):
                                existing_q.acceptance_rate = acceptance_rate
                                existing_q.difficulty = difficulty
                            question = existing_q
                        else:
                            question = Question(
                                title=title,
                                link=link,
                                difficulty=difficulty,
                                acceptance_rate=acceptance_rate,
                            )
                            db.add(question)
                            db.flush()
                            stats["questions"] += 1

                        # Upsert CompanyQuestionStat
                        existing_stat = (
                            db.query(CompanyQuestionStat)
                            .filter(
                                CompanyQuestionStat.company_id == company.id,
                                CompanyQuestionStat.question_id == question.id,
                                CompanyQuestionStat.time_window == tw,
                            )
                            .first()
                        )
                        if existing_stat:
                            if existing_stat.frequency != frequency:
                                existing_stat.frequency = frequency
                        else:
                            stat = CompanyQuestionStat(
                                company_id=company.id,
                                question_id=question.id,
                                time_window=tw,
                                frequency=frequency,
                            )
                            db.add(stat)
                            stats["stat_rows"] += 1

                    except Exception as e:
                        msg = f"Error processing row in {csv_file.relative_to(DATA_DIR)}: {e}"
                        logger.error("    %s", msg)
                        stats["errors"].append(msg)
                        continue

            # Check for expected missing files
            all_time_windows = {"THIRTY_DAYS", "THREE_MONTHS", "SIX_MONTHS", "MORE_THAN_SIX_MONTHS", "ALL"}
            missing = all_time_windows - processed_windows
            for m in sorted(missing):
                stats["missing_files"].append(f"{company_name}/{m}")

            db.commit()
            logger.info("  Processed %s (%d rows)", company_name, len(rows) if csv_files else 0)

    except Exception:
        db.rollback()
        logger.exception("Fatal error during import")
        raise
    finally:
        db.close()

    logger.info("=" * 50)
    logger.info("Import complete!")
    logger.info("  Companies processed:  %d", stats["companies"])
    logger.info("  New questions added:  %d", stats["questions"])
    logger.info("  Stat rows inserted:   %d", stats["stat_rows"])
    if stats["missing_files"]:
        logger.info("  Missing files:        %d", len(stats["missing_files"]))
        for mf in stats["missing_files"]:
            logger.info("    - %s", mf)
    if stats["errors"]:
        logger.info("  Errors:               %d", len(stats["errors"]))
        for err in stats["errors"]:
            logger.info("    - %s", err)


if __name__ == "__main__":
    run()
