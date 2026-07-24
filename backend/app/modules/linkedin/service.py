"""LinkedIn analysis service layer.

Handles storing and retrieving LinkedIn profile analyses.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from sqlalchemy.orm import Session

from app.modules.linkedin.models import LinkedinAnalysis

logger = logging.getLogger(__name__)


def create_analysis(
    user_id: int,
    raw_text: str,
    sections: dict[str, Any],
    detected_sections: list[str],
    warnings: list[str],
    db: Session,
) -> LinkedinAnalysis:
    """Persist a new LinkedIn analysis record."""
    sections_with_meta = {
        **sections,
        "_detected_sections": detected_sections,
        "_warnings": warnings,
    }

    analysis = LinkedinAnalysis(
        user_id=user_id,
        raw_text=raw_text,
        sections=json.dumps(sections_with_meta),
        scores=None,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


def get_analysis(analysis_id: int, user_id: int, db: Session) -> LinkedinAnalysis:
    """Fetch a single analysis, verifying ownership."""
    analysis = db.query(LinkedinAnalysis).filter(
        LinkedinAnalysis.id == analysis_id,
        LinkedinAnalysis.user_id == user_id,
    ).first()
    if not analysis:
        raise ValueError("Analysis not found.")
    return analysis


def list_analyses(user_id: int, db: Session) -> list[dict[str, Any]]:
    """List all analyses for a user, newest first."""
    analyses = (
        db.query(LinkedinAnalysis)
        .filter(LinkedinAnalysis.user_id == user_id)
        .order_by(LinkedinAnalysis.created_at.desc())
        .all()
    )
    results = []
    for a in analyses:
        sections = json.loads(a.sections) if a.sections else {}
        scores = json.loads(a.scores) if a.scores else None
        results.append({
            "id": a.id,
            "created_at": a.created_at.isoformat() if a.created_at else "",
            "detected_sections": sections.get("_detected_sections", []),
            "warnings": sections.get("_warnings", []),
            "score": scores.get("score") if scores else None,
        })
    return results


def delete_analysis(analysis_id: int, user_id: int, db: Session) -> None:
    """Delete an analysis after verifying ownership."""
    analysis = get_analysis(analysis_id, user_id, db)
    db.delete(analysis)
    db.commit()


def _get_sections(analysis: LinkedinAnalysis) -> dict[str, Any]:
    """Extract the clean sections dict (without metadata keys)."""
    sections = json.loads(analysis.sections) if analysis.sections else {}
    sections.pop("_detected_sections", None)
    sections.pop("_warnings", None)
    return sections


def persist_scores(analysis: LinkedinAnalysis, scores: dict[str, Any], db: Session) -> None:
    """Write computed scores back to the analysis record."""
    analysis.scores = json.dumps(scores)
    db.commit()


def persist_rewrite(
    analysis: LinkedinAnalysis,
    rewrite_type: str,
    original: str,
    rewritten: str,
    db: Session,
) -> None:
    """Store a rewrite result inside the scores JSON under 'rewrites'."""
    scores = json.loads(analysis.scores) if analysis.scores else {}
    rewrites = scores.get("rewrites", {})
    rewrites[rewrite_type] = {"original": original, "rewritten": rewritten}
    scores["rewrites"] = rewrites
    analysis.scores = json.dumps(scores)
    db.commit()


def _to_response_dict(analysis: LinkedinAnalysis) -> dict[str, Any]:
    """Convert an analysis model to a response-friendly dict."""
    sections = json.loads(analysis.sections) if analysis.sections else {}
    detected = sections.pop("_detected_sections", [])
    warnings = sections.pop("_warnings", [])

    return {
        "id": analysis.id,
        "raw_text": analysis.raw_text,
        "sections": sections,
        "detected_sections": detected,
        "warnings": warnings,
        "scores": json.loads(analysis.scores) if analysis.scores else None,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else "",
    }
