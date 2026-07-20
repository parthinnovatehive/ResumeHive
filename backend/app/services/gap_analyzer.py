"""
Gap Analysis Engine.

Compares a resume against a target role taxonomy to identify present skills,
missing skills, and generates actionable suggestions for each gap.
"""

from __future__ import annotations

import json
import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

_taxonomy_cache: dict[str, Any] = {}


def _load_taxonomy() -> dict[str, Any]:
    global _taxonomy_cache
    if _taxonomy_cache:
        return _taxonomy_cache
    path = os.path.join(_DATA_DIR, "role_taxonomy.json")
    try:
        with open(path, "r", encoding="utf-8") as fh:
            _taxonomy_cache = json.load(fh)
    except FileNotFoundError:
        logger.warning("role_taxonomy.json not found at %s", path)
        _taxonomy_cache = {"roles": {}, "role_categories": {}}
    return _taxonomy_cache


def get_all_roles() -> dict[str, str]:
    """Return {role_key: role_display_name} for every role."""
    tax = _load_taxonomy()
    return {
        key: val.get("name", key)
        for key, val in tax.get("roles", {}).items()
    }


def get_role_categories() -> dict[str, list[str]]:
    """Return the category→roles mapping."""
    return _load_taxonomy().get("role_categories", {})


def _ensure_list(val: Any) -> list:
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except (json.JSONDecodeError, TypeError):
            return []
    return []


def _ensure_str(val: Any) -> str:
    return val if isinstance(val, str) else str(val) if val else ""


def _extract_resume_corpus(data: dict[str, Any]) -> str:
    """Flatten every meaningful resume field into a single lowercase text blob."""
    parts: list[str] = []
    for key in ("full_name", "summary", "location"):
        parts.append(_ensure_str(data.get(key, "")).lower())

    for coll in ("education", "experience", "projects", "skills", "certifications"):
        for item in _ensure_list(data.get(coll, [])):
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        parts.append(v.lower())
                    elif isinstance(v, list):
                        parts.extend(str(x).lower() for x in v)
            elif isinstance(item, str):
                parts.append(item.lower())
    return " ".join(parts)


def _extract_resume_skills(data: dict[str, Any]) -> set[str]:
    """Extract all explicit skill tags and certification names."""
    skills: set[str] = set()
    for s in _ensure_list(data.get("skills", [])):
        skills.add(_ensure_str(s).lower().strip())
    for c in _ensure_list(data.get("certifications", [])):
        skills.add(_ensure_str(c).lower().strip())
    return skills


def _match_skill(
    skill: str,
    corpus: str,
    explicit_skills: set[str],
) -> bool:
    """Check if a taxonomy skill is present in the resume."""
    skill_lower = skill.lower().strip()

    # Direct match in explicit skill tags
    if skill_lower in explicit_skills:
        return True

    # Partial match against explicit skills
    for es in explicit_skills:
        if skill_lower in es or es in skill_lower:
            return True

    # Substring match in the full corpus
    if skill_lower in corpus:
        return True

    # Check multi-word skills by ensuring all words appear
    words = skill_lower.split()
    if len(words) > 1 and all(w in corpus for w in words):
        return True

    return False


def _generate_suggestion(
    skill: str,
    category: str,
    role_name: str,
    total_for_category: int,
    matched_in_category: int,
) -> str:
    """Generate a template-based suggestion for a missing skill."""
    coverage_pct = (
        round(matched_in_category / max(total_for_category, 1) * 100)
    )

    templates = {
        "skills": [
            f'Add "{skill}" to your skills section — it is a core requirement for {role_name} roles.',
            f'Include "{skill}" in your experience descriptions to improve keyword matching for {role_name} positions.',
            f'Consider adding "{skill}" to your skill set; it is frequently listed in {role_name} job postings.',
        ],
        "certifications": [
            f'Pursue the "{skill}" certification to strengthen your {role_name} profile.',
            f'Add "{skill}" certification — it is highly valued in {role_name} roles.',
        ],
        "projects": [
            f'Build a project involving {skill} to demonstrate practical {role_name} experience.',
            f'Add a project showcasing {skill} — it is a key differentiator for {role_name} roles.',
        ],
        "soft_skills": [
            f'Demonstrate "{skill}" through specific examples in your experience section.',
            f'Highlight "{skill}" in your resume — it is essential for {role_name} roles.',
        ],
    }

    category_templates = templates.get(category, templates["skills"])

    # Pick suggestion based on a hash of the skill name for determinism
    idx = sum(ord(c) for c in skill) % len(category_templates)
    return category_templates[idx]


def analyze_resume(
    data: dict[str, Any],
    target_role: str,
) -> dict[str, Any]:
    """Run gap analysis of a resume against a target role.

    Returns a dict with:
        - role: target role key
        - role_name: display name
        - total_skills: total items in taxonomy for this role
        - present_count: how many the resume already covers
        - coverage_pct: 0-100 percentage
        - present: list of matched items with category
        - missing: list of missing items with category and suggestion
    """
    tax = _load_taxonomy()
    role_key = target_role.lower().replace(" ", "_").replace("-", "_")
    role_data = tax.get("roles", {}).get(role_key)

    if not role_data:
        return {
            "role": target_role,
            "role_name": target_role,
            "total_skills": 0,
            "present_count": 0,
            "coverage_pct": 0,
            "present": [],
            "missing": [],
        }

    role_name = role_data.get("name", target_role)
    corpus = _extract_resume_corpus(data)
    explicit_skills = _extract_resume_skills(data)

    present: list[dict[str, str]] = []
    missing: list[dict[str, str]] = []

    categories = ["skills", "certifications", "projects", "soft_skills"]

    for cat in categories:
        items = role_data.get(cat, [])
        cat_present = 0

        for item in items:
            if _match_skill(item, corpus, explicit_skills):
                present.append({"item": item, "category": cat})
                cat_present += 1
            else:
                suggestion = _generate_suggestion(
                    item, cat, role_name, len(items), cat_present
                )
                missing.append({
                    "item": item,
                    "category": cat,
                    "suggestion": suggestion,
                })

    total = len(present) + len(missing)
    present_count = len(present)
    coverage_pct = round(present_count / max(total, 1) * 100)

    # Sort missing by category then alphabetically
    missing.sort(key=lambda x: (x["category"], x["item"]))

    return {
        "role": role_key,
        "role_name": role_name,
        "total_skills": total,
        "present_count": present_count,
        "coverage_pct": coverage_pct,
        "present": present,
        "missing": missing,
    }
