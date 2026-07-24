"""
LinkedIn profile rule-based scoring engine.

Four weighted categories (0-100 total):
    Headline            25 pts  — length heuristic + role-keyword presence
    About Keywords      25 pts  — keyword density against role taxonomy
    Skills Coverage     25 pts  — listed skills vs role-expected skills
    Experience Quality  25 pts  — bullet quality (reuses bullet_analyzer)

Pure-Python — no LLM.  Follows the same scoring pattern as ats_scorer.py
so the UI stays consistent (per-category breakdown + suggestions list).
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Data paths
# ---------------------------------------------------------------------------

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

_taxonomy_cache: dict[str, Any] = {}
_keyword_cache: dict[str, Any] = {}


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
        _taxonomy_cache = {"roles": {}}
    return _taxonomy_cache


def _load_keywords() -> dict[str, Any]:
    global _keyword_cache
    if _keyword_cache:
        return _keyword_cache
    path = os.path.join(_DATA_DIR, "role_keywords.json")
    try:
        with open(path, "r", encoding="utf-8") as fh:
            _keyword_cache = json.load(fh)
    except FileNotFoundError:
        logger.warning("role_keywords.json not found at %s", path)
        _keyword_cache = {"roles": {}}
    return _keyword_cache


def get_role_skills(role_key: str) -> list[str]:
    """Return the skills list for a role from the taxonomy."""
    tax = _load_taxonomy()
    entry = tax.get("roles", {}).get(role_key, {})
    return entry.get("skills", [])


def get_role_keywords(role_key: str) -> list[str]:
    """Return the keyword list for a role from the keyword library."""
    lib = _load_keywords()
    entry = lib.get("roles", {}).get(role_key, {})
    return entry.get("keywords", [])


def get_all_role_keys() -> list[str]:
    """Return all available role keys."""
    tax = _load_taxonomy()
    return sorted(tax.get("roles", {}).keys())


# ---------------------------------------------------------------------------
# Weights
# ---------------------------------------------------------------------------

_WEIGHTS = {
    "headline": 25,
    "about_keywords": 25,
    "skills_coverage": 25,
    "experience_quality": 25,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _normalise_skill(s: str) -> str:
    """Lowercase, strip whitespace/punctuation for comparison."""
    return re.sub(r"[^a-z0-9+#.]", "", s.lower().strip())


def _extract_all_text(sections: dict[str, Any]) -> str:
    """Flatten all section text into one blob for keyword searching."""
    parts: list[str] = []
    if sections.get("headline"):
        parts.append(sections["headline"])
    if sections.get("about"):
        parts.append(sections["about"])
    for exp in sections.get("experience", []):
        if isinstance(exp, dict):
            parts.append(exp.get("title", ""))
            parts.append(exp.get("company", ""))
            parts.append(exp.get("description", ""))
    for edu in sections.get("education", []):
        if isinstance(edu, dict):
            parts.append(edu.get("info", ""))
    parts.extend(sections.get("skills", []))
    parts.extend(sections.get("certifications", []))
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Category 1: Headline  (max 25 pts)
# ---------------------------------------------------------------------------

# LinkedIn headline optimal range: 40-120 characters
_HEADLINE_MIN = 40
_HEADLINE_MAX = 120
_HEADLINE_IDEAL_MAX = 100


def _score_headline(
    sections: dict[str, Any],
    role: str | None,
) -> tuple[float, float, list[str]]:
    """Score the headline on length, specificity, and role-keyword presence."""
    max_pts = float(_WEIGHTS["headline"])
    suggestions: list[str] = []
    headline = (sections.get("headline") or "").strip()

    if not headline:
        suggestions.append(
            "Add a professional headline — this is the first thing recruiters see. "
            "Include your role title and a key skill (e.g. 'Software Engineer | Python & Cloud')."
        )
        return 0.0, max_pts, suggestions

    points = 0.0
    length = len(headline)

    # --- Length heuristic (12 pts) ---
    if _HEADLINE_MIN <= length <= _HEADLINE_IDEAL_MAX:
        points += 12.0
    elif length < _HEADLINE_MIN:
        # Proportional: 20 chars = 6 pts, 30 chars = 9 pts
        points += 12.0 * (length / _HEADLINE_MIN)
        suggestions.append(
            f"Your headline is only {length} characters — aim for {_HEADLINE_MIN}-{_HEADLINE_MAX} "
            "to make a strong impression."
        )
    elif length <= _HEADLINE_MAX:
        points += 12.0
        suggestions.append(
            f"Your headline is {length} characters — consider trimming under "
            f"{_HEADLINE_IDEAL_MAX} for better readability on mobile."
        )
    else:
        # Over 120 chars — gets truncated on mobile
        points += 12.0 * (_HEADLINE_MAX / length)
        suggestions.append(
            f"Your headline is {length} characters and will be truncated on mobile. "
            f"Keep it under {_HEADLINE_MAX} characters."
        )

    # --- Separator / structure check (4 pts) ---
    # Good headlines often use " | " or " - " or " · " separators
    has_separator = bool(re.search(r"\s[|·–-]\s", headline))
    if has_separator:
        points += 4.0
    else:
        suggestions.append(
            "Use a separator (e.g. ' | ') in your headline to structure it "
            "(e.g. 'Software Engineer | Python & Cloud | Open Source')."
        )

    # --- Role-keyword presence (9 pts) ---
    if role:
        role_kws = [kw.lower() for kw in get_role_keywords(role)]
        headline_lower = headline.lower()
        matched = [kw for kw in role_kws if kw in headline_lower]
        if matched:
            # 9 pts for first match, diminishing returns after
            points += min(9.0, 5.0 + 2.0 * min(len(matched), 2))
        else:
            suggestions.append(
                f"Include your target role title in the headline "
                f"(e.g. add 'Software Engineer' or 'Data Analyst')."
            )
    else:
        # No role specified — partial credit if headline has any professional title words
        title_words = {"engineer", "developer", "analyst", "designer", "manager",
                       "architect", "scientist", "lead", "specialist", "consultant"}
        if any(w in headline.lower() for w in title_words):
            points += 6.0
        else:
            points += 3.0
            suggestions.append(
                "Include your professional title in the headline "
                "(e.g. 'Software Engineer', 'Data Analyst')."
            )

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 2: About Keywords  (max 25 pts)
# ---------------------------------------------------------------------------


def _score_about_keywords(
    sections: dict[str, Any],
    role: str | None,
) -> tuple[float, float, list[str]]:
    """Keyword density scoring for the About section.

    Uses the same non-linear curve as the ATS scorer's keyword category:
    30% keyword coverage → ~60% of points.
    """
    max_pts = float(_WEIGHTS["about_keywords"])
    suggestions: list[str] = []
    about = (sections.get("about") or "").strip()

    if not about:
        suggestions.append(
            "Write an About section — this is your elevator pitch. "
            "Summarise your experience, key skills, and what you're looking for."
        )
        return 0.0, max_pts, suggestions

    # --- Base quality: word count and structure (7 pts) ---
    word_count = len(about.split())
    points = 0.0

    if word_count >= 40:
        points += 7.0
    elif word_count >= 20:
        points += 5.0
        suggestions.append(
            f"Your About section is only {word_count} words — aim for 40-150 words "
            "to give enough context without overwhelming readers."
        )
    else:
        points += 2.0
        suggestions.append(
            f"Your About section is very short ({word_count} words). "
            "Expand it to 40-150 words covering your expertise and goals."
        )

    # --- Role keyword overlap (18 pts) ---
    if role:
        role_kws = [kw.lower() for kw in get_role_keywords(role)]
        about_lower = about.lower()

        matched = set()
        for kw in role_kws:
            if kw in about_lower:
                matched.add(kw)

        ratio = len(matched) / max(len(role_kws), 1)
        # Same non-linear curve as ATS scorer
        kw_pts = 18.0 * min(1.0, (ratio / 0.35) ** 0.7)
        points += kw_pts

        if ratio < 0.05:
            suggestions.append(
                f"Your About section has very few {role}-related keywords. "
                "Weave in relevant skills and technologies you actually use."
            )
        elif ratio < 0.15:
            suggestions.append(
                f"Add more {role}-related terms to your About section "
                f"(currently matching {len(matched)}/{len(role_kws)} keywords)."
            )
    else:
        # No role — give partial credit based on professional language
        professional_words = {
            "experience", "skills", "developed", "implemented", "led",
            "managed", "designed", "built", "improved", "delivered",
        }
        about_lower = about.lower()
        matches = sum(1 for w in professional_words if w in about_lower)
        points += min(18.0, 6.0 * min(matches, 3))

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 3: Skills Coverage  (max 25 pts)
# ---------------------------------------------------------------------------


def _score_skills_coverage(
    sections: dict[str, Any],
    role: str | None,
) -> tuple[float, float, list[str]]:
    """Compare listed skills against the role's expected-skills list."""
    max_pts = float(_WEIGHTS["skills_coverage"])
    suggestions: list[str] = []
    listed = sections.get("skills", [])

    if not listed:
        suggestions.append(
            "Add skills to your profile — list at least 8-15 relevant technical and soft skills."
        )
        return 0.0, max_pts, suggestions

    # --- Count check (6 pts) ---
    count = len(listed)
    if count >= 10:
        points = 6.0
    elif count >= 5:
        points = 4.0
        suggestions.append(
            f"You have {count} skills listed — aim for 10-15 for a well-rounded profile."
        )
    else:
        points = 2.0
        suggestions.append(
            f"Only {count} skill(s) listed — add at least 10 relevant skills."
        )

    # --- Role-skill overlap (15 pts) ---
    if role:
        expected = {_normalise_skill(s) for s in get_role_skills(role)}
        actual = {_normalise_skill(s) for s in listed}

        # Also build a keyword-based set for fuzzy matching
        role_kws = {_normalise_skill(kw) for kw in get_role_keywords(role)}
        all_expected = expected | role_kws

        matched = actual & all_expected
        # Also check partial matches (e.g. "React.js" matches "react")
        partial_matches = set()
        for skill in actual:
            for exp in all_expected:
                if skill in exp or exp in skill:
                    partial_matches.add(exp)

        all_matched = matched | partial_matches
        ratio = len(all_matched) / max(len(all_expected), 1)
        kw_pts = 15.0 * min(1.0, (ratio / 0.3) ** 0.65)
        points += kw_pts

        missing = all_expected - all_matched
        if missing and len(missing) > 3:
            top_missing = sorted(missing)[:5]
            suggestions.append(
                f"Consider adding these {role}-relevant skills you're missing: "
                + ", ".join(top_missing)
                + " (only if you genuinely have them)."
            )
    else:
        # No role — partial credit for having skills
        points += min(15.0, 5.0 + count * 0.5)

    # --- Category diversity bonus (4 pts) ---
    # Check if skills span multiple categories (soft + technical)
    skill_lower = [s.lower() for s in listed]
    soft_indicators = {"communication", "leadership", "teamwork", "problem solving",
                       "time management", "management", "strategic"}
    has_soft = any(s in soft_indicators for s in skill_lower)
    has_tech = len(skill_lower) > len(soft_indicators & set(skill_lower))

    if has_soft and has_tech:
        points += 4.0
    elif has_soft or has_tech:
        points += 2.0
    else:
        suggestions.append(
            "Include both technical and soft skills for a balanced profile."
        )

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 4: Experience Quality  (max 25 pts)
# ---------------------------------------------------------------------------


def _score_experience_quality(sections: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Per-bullet quality analysis — reuses bullet_analyzer directly."""
    from app.services.bullet_analyzer import analyze_description

    max_pts = float(_WEIGHTS["experience_quality"])
    suggestions: list[str] = []
    experiences = sections.get("experience", [])

    if not experiences:
        suggestions.append(
            "Add work experience entries with detailed bullet points."
        )
        return 0.0, max_pts, suggestions

    # Collect all description text from experience entries
    descriptions: list[str] = []
    entries_with_desc = 0
    entries_with_title = 0

    for exp in experiences:
        if isinstance(exp, dict):
            title = (exp.get("title") or "").strip()
            desc = (exp.get("description") or "").strip()
            if title:
                entries_with_title += 1
            if desc:
                entries_with_desc += 1
                descriptions.append(desc)

    if not descriptions:
        suggestions.append(
            "Add description bullets to your experience entries — "
            "recruiters want to see what you accomplished, not just where you worked."
        )
        # Still give partial credit for having entries with titles
        if entries_with_title:
            return max_pts * 0.15, max_pts, suggestions
        return 0.0, max_pts, suggestions

    # --- Entry completeness (5 pts) ---
    total_entries = len(experiences)
    completeness_ratio = entries_with_title / max(total_entries, 1)
    entry_pts = 5.0 * completeness_ratio
    if completeness_ratio < 1.0:
        missing = total_entries - entries_with_title
        suggestions.append(
            f"{missing} experience entry/entries are missing a job title."
        )

    # --- Bullet quality via bullet_analyzer (15 pts) ---
    total_bullets = 0
    quant = 0
    verbs = 0
    passive = 0

    for desc in descriptions:
        stats = analyze_description(desc)["stats"]
        total_bullets += stats["total"]
        quant += stats["with_quantification"]
        verbs += stats["with_action_verb"]
        passive += stats["passive"]

    bullet_pts = 0.0
    if total_bullets == 0:
        suggestions.append(
            "Add bullet points to your experience descriptions — "
            "each bullet should describe a specific accomplishment."
        )
    else:
        # Action verbs (5 pts)
        verb_ratio = verbs / total_bullets
        bullet_pts += 5.0 * min(1.0, verb_ratio / 0.8)
        if verb_ratio < 0.5:
            suggestions.append(
                f"Start each bullet with a strong action verb — "
                f"only {verbs}/{total_bullets} bullets currently do."
            )

        # Quantification (5 pts)
        quant_ratio = quant / total_bullets
        bullet_pts += 5.0 * min(1.0, quant_ratio / 0.6)
        if quant_ratio < 0.3:
            suggestions.append(
                f"Add metrics to your bullets (e.g. 'reduced load time by 40%') — "
                f"only {quant}/{total_bullets} have quantifiable results."
            )

        # Active voice (5 pts)
        passive_ratio = passive / total_bullets
        bullet_pts += 5.0 * (1.0 - min(1.0, passive_ratio / 0.5))
        if passive:
            suggestions.append(
                f"Rewrite {passive} passive-voice bullet(s) in active voice."
            )

    # --- Description depth (5 pts) ---
    avg_words = sum(len(d.split()) for d in descriptions) / max(len(descriptions), 1)
    if avg_words >= 20:
        depth_pts = 5.0
    elif avg_words >= 10:
        depth_pts = 3.0
        suggestions.append(
            "Expand your bullet points — aim for 2-3 lines per bullet with specific details."
        )
    else:
        depth_pts = 1.0
        suggestions.append(
            "Your experience descriptions are very brief — add more detail "
            "about what you built, led, or achieved."
        )

    points = entry_pts + bullet_pts + depth_pts

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def score_linkedin(
    sections: dict[str, Any],
    role: str | None = None,
) -> dict[str, Any]:
    """Score a LinkedIn profile across four weighted categories.

    Parameters
    ----------
    sections:
        Parsed LinkedIn sections dict (headline, about, experience, skills, etc.)
    role:
        Optional role key (e.g. "sde", "data_analyst") for role-specific scoring.

    Returns
    -------
    dict with keys:
        score       – int 0-100
        breakdown   – dict mapping category → points earned
        max         – dict mapping category → max possible
        suggestions – list of actionable improvement strings
        role        – the role used for scoring (if any)
    """
    all_suggestions: list[str] = []

    headline_pts, headline_max, headline_sugg = _score_headline(sections, role)
    about_pts, about_max, about_sugg = _score_about_keywords(sections, role)
    skills_pts, skills_max, skills_sugg = _score_skills_coverage(sections, role)
    exp_pts, exp_max, exp_sugg = _score_experience_quality(sections)

    all_suggestions.extend(headline_sugg)
    all_suggestions.extend(about_sugg)
    all_suggestions.extend(skills_sugg)
    all_suggestions.extend(exp_sugg)

    breakdown = {
        "headline": round(headline_pts, 1),
        "about_keywords": round(about_pts, 1),
        "skills_coverage": round(skills_pts, 1),
        "experience_quality": round(exp_pts, 1),
    }

    maxes: dict[str, float] = {
        "headline": headline_max,
        "about_keywords": about_max,
        "skills_coverage": skills_max,
        "experience_quality": exp_max,
    }

    total = sum(breakdown.values())
    score = max(0, min(100, round(total)))

    return {
        "score": score,
        "breakdown": breakdown,
        "max": maxes,
        "suggestions": all_suggestions,
        "role": role,
    }
