"""
ATS (Applicant Tracking System) Scoring Engine.

Rule-based scoring (0-100) across six weighted categories:
    Format & Structure   25 %
    Contact Information  15 %
    Keywords             30 %
    Achievements         15 %
    Length               10 %
    Education             5 %

Pure-Python core — no external API calls.  Optional spaCy / scikit-learn
integration is detected at import time and used for richer analysis when
available.
"""

from __future__ import annotations

import difflib
import json
import os
import re
import math
import logging
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional NLP dependencies (graceful degradation)
# ---------------------------------------------------------------------------

_SPACY_NLP = None
try:
    import spacy as _spacy_mod

    try:
        _SPACY_NLP = _spacy_mod.load("en_core_web_sm")
    except Exception:
        logger.debug("spaCy model en_core_web_sm not installed; using regex fallbacks.")
except ImportError:
    pass

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

_STANDARD_SECTIONS = frozenset({
    "summary", "experience", "education", "projects", "skills", "certifications",
})

# ATS-safe header names (lowercase). Anything a student renames a section to
# is fuzzy-matched against these; no close match → flagged as non-standard.
_HEADER_WHITELIST = frozenset({
    "summary", "professional summary", "objective", "about",
    "experience", "work experience", "professional experience",
    "employment history", "internships",
    "education", "academic background",
    "projects", "personal projects", "academic projects",
    "skills", "technical skills", "core skills",
    "certifications", "certificates", "licenses",
    "achievements", "awards", "publications", "languages",
    "volunteer experience", "extracurricular activities",
})

# Similarity threshold for accepting a header as a variant of a standard one
_HEADER_FUZZ_CUTOFF = 0.8


def check_section_headers(headers: list[str]) -> dict[str, Any]:
    """Fuzzy-match section headers against the ATS-safe whitelist.

    Returns a dict with ``standard`` (accepted headers) and
    ``non_standard`` (list of ``{header, suggestion}`` for headers no ATS
    parser is likely to recognise, each with the closest safe alternative).
    """
    standard: list[str] = []
    non_standard: list[dict[str, str]] = []

    for header in headers:
        name = _ensure_str(header).strip().lower().replace("_", " ")
        if not name:
            continue
        if name in _HEADER_WHITELIST:
            standard.append(header)
            continue
        matches = difflib.get_close_matches(
            name, _HEADER_WHITELIST, n=1, cutoff=_HEADER_FUZZ_CUTOFF
        )
        if matches:
            standard.append(header)
        else:
            # Find the closest whitelist entry (no cutoff) as a suggestion
            closest = difflib.get_close_matches(name, _HEADER_WHITELIST, n=1, cutoff=0.0)
            non_standard.append({
                "header": header,
                "suggestion": closest[0].title() if closest else "Experience",
            })

    return {"standard": standard, "non_standard": non_standard}

_WEIGHTS = {
    "format": 25,
    "contact": 10,
    "keywords": 25,
    "achievements": 25,   # per-bullet quality (quantification, verbs, voice)
    "length": 10,
    "education": 5,
}

# When a job description is pasted, JD match takes this many points and the
# six base categories are scaled down to share the remaining 75.
_JD_WEIGHT = 25

# Words per A4 page (roughly 500 words for a typical resume)
_WORDS_PER_PAGE = 500

# ---------------------------------------------------------------------------
# Keyword library loader
# ---------------------------------------------------------------------------

_keyword_cache: dict[str, Any] = {}


def _load_keywords() -> dict[str, Any]:
    """Load the role-keyword library from the JSON data file."""
    global _keyword_cache
    if _keyword_cache:
        return _keyword_cache
    path = os.path.join(_DATA_DIR, "role_keywords.json")
    try:
        with open(path, "r", encoding="utf-8") as fh:
            _keyword_cache = json.load(fh)
    except FileNotFoundError:
        logger.warning("role_keywords.json not found at %s", path)
        _keyword_cache = {"roles": {}, "action_verbs": [], "quantification_patterns": []}
    return _keyword_cache


def get_role_keywords(role: str) -> list[str]:
    """Return the keyword list for a given role key (e.g. 'sde')."""
    lib = _load_keywords()
    role_key = role.lower().replace(" ", "_").replace("-", "_")
    entry = lib.get("roles", {}).get(role_key, {})
    return entry.get("keywords", [])


def get_action_verbs() -> set[str]:
    """Return the master set of action verbs."""
    lib = _load_keywords()
    verbs = lib.get("action_verbs", [])
    if not verbs:
        # Hardcoded fallback
        verbs = [
            "achieved", "administered", "analyzed", "automated", "built",
            "collaborated", "coordinated", "created", "decreased", "delivered",
            "demonstrated", "designed", "developed", "directed", "drove",
            "established", "evaluated", "executed", "expanded", "facilitated",
            "generated", "grew", "identified", "implemented", "improved",
            "increased", "initiated", "integrated", "introduced", "launched",
            "led", "maintained", "managed", "mentored", "migrated",
            "negotiated", "optimized", "orchestrated", "organized", "overhauled",
            "performed", "planned", "produced", "proposed", "reduced",
            "refactored", "reorganized", "resolved", "revamped", "scaled",
            "spearheaded", "standardized", "streamlined", "strengthened",
            "supervised", "transformed", "troubleshot", "unified", "upgraded",
            "validated", "pioneered",
        ]
    return {v.lower() for v in verbs}


def get_quantification_patterns() -> list[str]:
    """Return regex patterns that detect quantifiable results."""
    lib = _load_keywords()
    patterns = lib.get("quantification_patterns", [])
    if not patterns:
        patterns = [
            r"\d+%", r"\$\d+", r"\d+\+",
            r"\b\d{1,3}(,\d{3})+\b",
            r"\b\d+x\b", r"\bfold\b",
            r"\b\d+ (users|customers|clients|team members|engineers|developers)\b",
            r"\b\d+ (minutes|hours|days|weeks|months|years)\b",
            r"\b\$\d+[kmb]?\b",
            r"\b\d+ (projects|features|releases|deployments)\b",
        ]
    return patterns


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def _ensure_list(val: Any) -> list:
    """Coerce *val* into a list (deserialize JSON strings if needed)."""
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except (json.JSONDecodeError, TypeError):
            return []
    return []


def _ensure_str(val: Any) -> str:
    """Coerce *val* into a plain string."""
    if isinstance(val, str):
        return val
    return str(val) if val else ""


def _extract_text(data: dict[str, Any]) -> str:
    """Flatten every meaningful resume field into a single text blob."""
    parts: list[str] = []
    for key in (
        "full_name", "email", "phone", "location", "linkedin_url", "summary",
    ):
        parts.append(_ensure_str(data.get(key, "")))

    for collection_key in ("education", "experience", "projects", "skills", "certifications"):
        items = _ensure_list(data.get(collection_key, []))
        for item in items:
            if isinstance(item, dict):
                for v in item.values():
                    if isinstance(v, str):
                        parts.append(v)
                    elif isinstance(v, list):
                        parts.extend(str(x) for x in v)
            elif isinstance(item, str):
                parts.append(item)

    return " ".join(parts)


def _word_count(data: dict[str, Any]) -> int:
    """Count words across all resume text fields."""
    text = _extract_text(data)
    return len(text.split())


def _sentences(text: str) -> list[str]:
    """Split text into sentences (regex-based)."""
    if not text.strip():
        return []
    return [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]


# ---------------------------------------------------------------------------
# Category 1: Format & Structure  (max 25 pts)
# ---------------------------------------------------------------------------

def _score_format(data: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Evaluate section structure, ordering, and formatting cleanliness."""
    points = 0.0
    max_pts = _WEIGHTS["format"]
    suggestions: list[str] = []

    section_order = _ensure_list(data.get("section_order", []))
    has_content = {
        "summary": bool(_ensure_str(data.get("summary", "")).strip()),
        "experience": bool(_ensure_list(data.get("experience", []))),
        "education": bool(_ensure_list(data.get("education", []))),
        "projects": bool(_ensure_list(data.get("projects", []))),
        "skills": bool(_ensure_list(data.get("skills", []))),
        "certifications": bool(_ensure_list(data.get("certifications", []))),
    }

    # (a) section_order defined and non-empty  → 3 pts
    if section_order and len(section_order) >= 3:
        points += 3.0
    elif section_order:
        points += 1.5
        suggestions.append(
            "Add more sections to your section order (summary, experience, education, projects, skills)."
        )
    else:
        suggestions.append(
            "Define a section_order to control the layout of your resume."
        )

    # (a2) Section headers match the ATS-safe whitelist (fuzzy)  → 2 pts
    header_check = check_section_headers([str(s) for s in section_order])
    if section_order and not header_check["non_standard"]:
        points += 2.0
    elif header_check["non_standard"]:
        for item in header_check["non_standard"]:
            suggestions.append(
                f"Section header '{item['header']}' is non-standard — ATS parsers "
                f"may skip it. Rename it to '{item['suggestion']}'."
            )

    # (b) Standard sections present with content  → up to 8 pts
    standard_present = sum(
        1 for s in _STANDARD_SECTIONS if has_content.get(s, False)
    )
    points += (standard_present / len(_STANDARD_SECTIONS)) * 8.0

    missing = [s for s in _STANDARD_SECTIONS if not has_content.get(s, False)]
    if missing:
        suggestions.append(
            f"Add content to missing sections: {', '.join(sorted(missing))}."
        )

    # (c) No table-like formatting (pipe chars, excessive tabs)  → 4 pts
    all_text = _extract_text(data)
    pipe_count = all_text.count("|")
    if pipe_count > 5:
        points += 0.0
        suggestions.append(
            "Avoid table-like formatting (excessive pipe characters '|' can confuse ATS parsers)."
        )
    else:
        points += 4.0

    # (d) No image references  → 4 pts
    img_patterns = re.findall(r"<img|!\[.*\]\(|\.png|\.jpg|\.jpeg|\.gif|\.svg", all_text, re.I)
    if img_patterns:
        points += 0.0
        suggestions.append("Remove images from your resume — most ATS systems cannot parse them.")
    else:
        points += 4.0

    # (e) Clean structure — summary is 2-4 sentences  → 4 pts
    summary = _ensure_str(data.get("summary", ""))
    sents = _sentences(summary)
    if 2 <= len(sents) <= 5:
        points += 4.0
    elif len(sents) == 1 and len(summary.split()) >= 10:
        points += 2.0
        suggestions.append(
            "Expand your summary to 2-4 sentences for better ATS readability."
        )
    elif not summary.strip():
        points += 0.0
        suggestions.append("Add a professional summary (2-4 sentences).")
    else:
        points += 2.5

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 2: Contact Information  (max 15 pts)
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
_PHONE_RE = re.compile(r"^[6-9]\d{9}$")
_LINKEDIN_RE = re.compile(r"linkedin\.com/in/", re.I)


def _score_contact(data: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Validate presence and format of contact fields."""
    points = 0.0
    max_pts = _WEIGHTS["contact"]
    suggestions: list[str] = []

    full_name = _ensure_str(data.get("full_name", "")).strip()
    email = _ensure_str(data.get("email", "")).strip()
    phone = _ensure_str(data.get("phone", "")).strip()
    location = _ensure_str(data.get("location", "")).strip()
    linkedin = _ensure_str(data.get("linkedin_url", "")).strip()

    # Full name  → 2 pts
    if full_name and len(full_name.split()) >= 2:
        points += 2.0
    elif full_name:
        points += 1.0
        suggestions.append("Include your full name (first and last).")
    else:
        suggestions.append("Add your full name to the contact section.")

    # Email  → 4 pts
    if email and _EMAIL_RE.match(email):
        points += 4.0
    elif email:
        points += 1.0
        suggestions.append("Fix your email format (e.g. name@example.com).")
    else:
        suggestions.append("Add a professional email address.")

    # Phone  → 4 pts
    digits_only = re.sub(r"\D", "", phone)
    if digits_only and _PHONE_RE.match(digits_only):
        points += 4.0
    elif phone:
        points += 1.5
        suggestions.append("Use a 10-digit Indian phone number starting with 6-9.")
    else:
        suggestions.append("Add your phone number to the contact section.")

    # Location  → 3 pts
    if location and len(location) >= 3:
        points += 3.0
    elif location:
        points += 1.0
    else:
        suggestions.append("Add your city/location (helps with regional job matching).")

    # LinkedIn  → 2 pts
    if linkedin and _LINKEDIN_RE.search(linkedin):
        points += 2.0
    elif linkedin:
        points += 0.5
        suggestions.append("Verify your LinkedIn URL contains '/in/your-profile'.")
    else:
        suggestions.append("Add your LinkedIn profile URL — it increases recruiter trust.")

    # Internal points sum to 15; normalise to the configured category weight
    points = points * (max_pts / 15.0)
    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 3: Keyword Match  (max 30 pts)
# ---------------------------------------------------------------------------

def _score_keywords(
    data: dict[str, Any],
    role: str | None = None,
) -> tuple[float, float, list[str]]:
    """TF-IDF-free keyword density scoring.

    If *role* is provided, match against role-specific keywords.
    Otherwise, use a generic software-engineering keyword set.
    """
    points = 0.0
    max_pts = _WEIGHTS["keywords"]
    suggestions: list[str] = []

    if role:
        role_kws = [kw.lower() for kw in get_role_keywords(role)]
    else:
        # Build a combined set from all roles as the "generic" fallback
        lib = _load_keywords()
        all_kws: set[str] = set()
        for role_data in lib.get("roles", {}).values():
            all_kws.update(kw.lower() for kw in role_data.get("keywords", []))
        role_kws = sorted(all_kws)

    if not role_kws:
        return max_pts, max_pts, []

    corpus = _extract_text(data).lower()
    skills_list = [_ensure_str(s).lower() for s in _ensure_list(data.get("skills", []))]

    # Count matched keywords
    matched: set[str] = set()
    for kw in role_kws:
        # Exact substring match in the corpus
        if kw in corpus:
            matched.add(kw)
        # Also check individual skill tags (partial match)
        for skill in skills_list:
            if kw in skill or skill in kw:
                matched.add(kw)
                break

    ratio = len(matched) / max(len(role_kws), 1)

    # Score: non-linear curve so that 30% coverage gives ~60% of the points
    # Formula: points = max_pts * min(1.0, (ratio / 0.35) ** 0.7)
    points = max_pts * min(1.0, (ratio / 0.35) ** 0.7)

    if ratio < 0.05:
        suggestions.append(
            f"Your resume matches very few {role or 'role'}-specific keywords. "
            "Review the job description and weave relevant terms into your experience and skills."
        )
    elif ratio < 0.15:
        suggestions.append(
            f"Add more {role or 'role'}-related keywords to your resume "
            f"(currently {len(matched)}/{len(role_kws)} matched)."
        )

    # If few skills listed, nudge
    if len(skills_list) < 5:
        suggestions.append(
            "List at least 8-12 relevant skills to improve keyword coverage."
        )

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 4: Achievements  (max 15 pts)
# ---------------------------------------------------------------------------

def _score_achievements(data: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Per-bullet quality: quantification, action verbs, and active voice.

    Delegates line-level analysis to ``bullet_analyzer`` so the score and
    the inline editor feedback always agree.
    """
    from app.services.bullet_analyzer import analyze_description

    max_pts = _WEIGHTS["achievements"]
    suggestions: list[str] = []

    # Collect all description text from experience and projects
    descriptions: list[str] = []
    for exp in _ensure_list(data.get("experience", [])):
        if isinstance(exp, dict):
            desc = _ensure_str(exp.get("description", ""))
            if desc:
                descriptions.append(desc)
    for proj in _ensure_list(data.get("projects", [])):
        if isinstance(proj, dict):
            desc = _ensure_str(proj.get("description", ""))
            if desc:
                descriptions.append(desc)

    if not descriptions:
        suggestions.append(
            "Add descriptions to your experience and project entries."
        )
        return 0.0, max_pts, suggestions

    total = 0
    quant = 0
    verbs = 0
    passive = 0
    for desc in descriptions:
        stats = analyze_description(desc)["stats"]
        total += stats["total"]
        quant += stats["with_quantification"]
        verbs += stats["with_action_verb"]
        passive += stats["passive"]

    if total == 0:
        suggestions.append(
            "Add descriptions to your experience and project entries."
        )
        return 0.0, max_pts, suggestions

    # --- Action verbs (40% of category) ---
    verb_ratio = verbs / total
    points = max_pts * 0.4 * min(1.0, verb_ratio / 0.8)
    if verb_ratio < 0.5:
        suggestions.append(
            "Start each bullet point with a strong action verb "
            "(e.g. 'Led', 'Built', 'Optimised') — "
            f"{verbs}/{total} bullets currently do."
        )
    elif verb_ratio < 0.8:
        suggestions.append(
            "Good use of action verbs — try to start every bullet with one."
        )

    # --- Quantifiable results (40% of category) ---
    quant_ratio = quant / total
    points += max_pts * 0.4 * min(1.0, quant_ratio / 0.6)
    if quant_ratio < 0.3:
        suggestions.append(
            "Add numbers, percentages, or metrics to your bullet points "
            "(e.g. 'Improved API response time by 60%') — "
            f"{quant}/{total} bullets have one."
        )
    elif quant_ratio < 0.6:
        suggestions.append(
            "Include more quantifiable results "
            "(e.g. 'Reduced load time by 40%', 'Managed team of 5')."
        )

    # --- Active voice (20% of category) ---
    passive_ratio = passive / total
    points += max_pts * 0.2 * (1.0 - min(1.0, passive_ratio / 0.5))
    if passive:
        suggestions.append(
            f"Rewrite {passive} passive-voice bullet(s) in active voice — "
            "'Built the API' instead of 'The API was built'."
        )

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 5: Length  (max 10 pts)
# ---------------------------------------------------------------------------

def _score_length(data: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Evaluate word count against the 300-800 optimal range."""
    wc = _word_count(data)
    max_pts = _WEIGHTS["length"]
    suggestions: list[str] = []

    if 300 <= wc <= 800:
        return max_pts, max_pts, suggestions
    elif 200 <= wc < 300:
        pts = max_pts * 0.6
        suggestions.append(
            f"Resume is slightly short ({wc} words). "
            "Aim for 300-800 words to give ATS parsers enough content."
        )
        return pts, max_pts, suggestions
    elif 800 < wc <= 1000:
        pts = max_pts * 0.7
        suggestions.append(
            f"Resume is slightly long ({wc} words). "
            "Consider trimming to under 800 words for a concise, impactful read."
        )
        return pts, max_pts, suggestions
    elif wc < 200:
        suggestions.append(
            f"Resume is too short ({wc} words). "
            "Add more detail to your experience, projects, and summary."
        )
        return 0.0, max_pts, suggestions
    else:
        suggestions.append(
            f"Resume is very long ({wc} words). "
            "Trim to 300-800 words — recruiters spend ~7 seconds scanning."
        )
        return max_pts * 0.3, max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 6: Education  (max 5 pts)
# ---------------------------------------------------------------------------

def _score_education(data: dict[str, Any]) -> tuple[float, float, list[str]]:
    """Check education entries for completeness."""
    max_pts = _WEIGHTS["education"]
    suggestions: list[str] = []
    education = _ensure_list(data.get("education", []))

    if not education:
        suggestions.append("Add an education section with your degree and institution.")
        return 0.0, max_pts, suggestions

    points = 0.0

    # At least one entry  → 2 pts
    points += 2.0

    first = education[0] if isinstance(education[0], dict) else {}

    # Has degree  → 1 pt
    if _ensure_str(first.get("degree", "")).strip():
        points += 1.0
    else:
        suggestions.append("Add your degree (e.g. 'B.Tech', 'B.Sc', 'MBA').")

    # Has institution  → 1 pt
    if _ensure_str(first.get("institution", "")).strip():
        points += 1.0
    else:
        suggestions.append("Add your college/university name.")

    # Has graduation year  → 1 pt
    end_date = _ensure_str(first.get("end_date", "")).strip()
    if end_date:
        points += 1.0
    else:
        suggestions.append("Add your graduation date or expected graduation year.")

    return min(points, max_pts), max_pts, suggestions


# ---------------------------------------------------------------------------
# Category 7: JD Match  (max 25 pts — only when a JD is provided)
# ---------------------------------------------------------------------------

def _score_jd_match(data: dict[str, Any], jd_text: str) -> tuple[float, float, list[str], dict[str, Any]]:
    """Score the resume against a pasted job description.

    Points blend cosine similarity (how much the documents overlap overall)
    with top-keyword coverage (how many of the JD's highest-weight terms
    appear in the resume). Raw cosine between a resume and JD rarely
    exceeds ~0.5 even for strong matches, so it's normalized against 0.45.
    """
    from app.services.jd_matcher import match_jd

    max_pts = float(_JD_WEIGHT)
    suggestions: list[str] = []

    result = match_jd(_extract_text(data), jd_text)

    sim_component = min(1.0, result["similarity"] / 0.45)
    coverage_component = result["match_pct"] / 100.0
    points = max_pts * (0.4 * sim_component + 0.6 * coverage_component)

    missing = result["missing_keywords"]
    if missing:
        top = ", ".join(m["keyword"] for m in missing[:5])
        suggestions.append(
            f"The job description mentions {top} — add these to your resume "
            "if they genuinely apply to you (never fabricate)."
        )
    if result["match_pct"] < 40:
        suggestions.append(
            f"Only {result['match_pct']}% of the top job-description keywords "
            "appear in your resume — tailor your skills and bullet points to this role."
        )

    return min(points, max_pts), max_pts, suggestions, result


# ---------------------------------------------------------------------------
# spaCy-enhanced helpers (when available)
# ---------------------------------------------------------------------------


def _spacy_ner_dates(text: str) -> list[str]:
    """Extract date entities via spaCy NER."""
    if _SPACY_NLP is None:
        return []
    doc = _SPACY_NLP(text)
    return [ent.text for ent in doc.ents if ent.label_ in ("DATE", "TIME")]


def _spacy_orgs(text: str) -> list[str]:
    """Extract organisation entities via spaCy NER."""
    if _SPACY_NLP is None:
        return []
    doc = _SPACY_NLP(text)
    return [ent.text for ent in doc.ents if ent.label_ == "ORG"]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def score_resume(
    data: dict[str, Any],
    role: str | None = None,
    jd_text: str | None = None,
) -> dict[str, Any]:
    """Score a resume across six weighted categories (seven with a JD).

    Parameters
    ----------
    data:
        Resume data dict (mirrors ``ResumeResponse``).
    role:
        Optional role key (e.g. ``"sde"``, ``"data_analyst"``) for
        role-specific keyword matching.
    jd_text:
        Optional pasted job-description text. When provided, a ``jd_match``
        category worth 25 points is added and the six base categories are
        scaled to share the remaining 75, so the total stays 0-100.

    Returns
    -------
    dict with keys:
        ``score``       – int 0-100
        ``breakdown``   – dict mapping category → points earned
        ``max``         – dict mapping category → max possible
        ``suggestions`` – list of actionable improvement strings
        ``jd_match``    – (only when *jd_text* given) similarity, matched
                          and missing keywords for the checklist UI
    """
    all_suggestions: list[str] = []

    format_pts, format_max, fmt_sugg = _score_format(data)
    contact_pts, contact_max, contact_sugg = _score_contact(data)
    keyword_pts, keyword_max, kw_sugg = _score_keywords(data, role)
    achieve_pts, achieve_max, ach_sugg = _score_achievements(data)
    length_pts, length_max, len_sugg = _score_length(data)
    edu_pts, edu_max, edu_sugg = _score_education(data)

    all_suggestions.extend(fmt_sugg)
    all_suggestions.extend(contact_sugg)
    all_suggestions.extend(kw_sugg)
    all_suggestions.extend(ach_sugg)
    all_suggestions.extend(len_sugg)
    all_suggestions.extend(edu_sugg)

    breakdown = {
        "format": round(format_pts, 1),
        "contact": round(contact_pts, 1),
        "keywords": round(keyword_pts, 1),
        "achievements": round(achieve_pts, 1),
        "length": round(length_pts, 1),
        "education": round(edu_pts, 1),
    }

    maxes: dict[str, float] = {
        "format": format_max,
        "contact": contact_max,
        "keywords": keyword_max,
        "achievements": achieve_max,
        "length": length_max,
        "education": edu_max,
    }

    jd_result: dict[str, Any] | None = None
    if jd_text and jd_text.strip():
        jd_pts, jd_max, jd_sugg, jd_result = _score_jd_match(data, jd_text)
        # Scale the six base categories to share (100 - JD weight) points
        scale = (100.0 - _JD_WEIGHT) / 100.0
        breakdown = {k: round(v * scale, 1) for k, v in breakdown.items()}
        maxes = {k: round(v * scale, 1) for k, v in maxes.items()}
        breakdown["jd_match"] = round(jd_pts, 1)
        maxes["jd_match"] = jd_max
        all_suggestions.extend(jd_sugg)

    total = sum(breakdown.values())
    # Round to nearest integer, clamp 0-100
    score = max(0, min(100, round(total)))

    result: dict[str, Any] = {
        "score": score,
        "breakdown": breakdown,
        "max": maxes,
        "suggestions": all_suggestions,
    }
    if jd_result is not None:
        result["jd_match"] = jd_result
    return result
