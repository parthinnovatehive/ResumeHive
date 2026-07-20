"""
Per-bullet quality analysis for resume descriptions.

Rule-based (regex + optional spaCy) checks applied to each bullet line:
    - quantification: does the bullet contain a number / % / currency /
      strong outcome word?
    - action verb: does the bullet start with a strong action verb?
    - weak start: does it open with a known weak phrase
      ("Responsible for", "Worked on", "Helped with", ...)?
    - passive voice: spaCy dependency parse (nsubjpass) when available,
      regex heuristic ("was built", "were developed") otherwise.

Used by the ATS scorer (aggregate bullet-quality category) and exposed
directly via POST /resumes/analyze-bullets for inline editor feedback.
No LLM involved — this is the cheap, deterministic layer.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from app.services.ats_scorer import (
    get_action_verbs,
    get_quantification_patterns,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional spaCy (graceful degradation, same pattern as ats_scorer)
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

# Strong outcome words that count as quantification even without a digit
_OUTCOME_WORDS_RE = re.compile(
    r"\b(increas\w+|decreas\w+|reduc\w+|improv\w+|grew|doubl\w+|tripl\w+|"
    r"accelerat\w+|sav\w+|boost\w+|cut|optimi[sz]\w+|scal\w+)\b",
    re.I,
)

# Common weak bullet openers
_WEAK_STARTS = (
    "responsible for",
    "worked on",
    "worked with",
    "helped with",
    "helped to",
    "helped in",
    "assisted in",
    "assisted with",
    "involved in",
    "participated in",
    "was part of",
    "part of",
    "tasked with",
    "duties included",
    "in charge of",
)

# Passive-voice regex fallback: be-verb + past participle
_PASSIVE_RE = re.compile(
    r"\b(was|were|is|are|been|being|be)\s+(\w+ed|built|made|done|given|"
    r"taken|written|driven|shown|known|chosen|held|kept|led|won)\b",
    re.I,
)

# Split a description blob into bullet lines
_BULLET_SPLIT_RE = re.compile(r"[\n\r]+|(?:^|\s)[•▪‣·-]\s+")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def split_bullets(text: str) -> list[str]:
    """Split a description blob into individual bullet lines.

    Handles newline-separated and bullet-char-separated ("• ") text.
    Falls back to sentence splitting when the text is one long paragraph.
    """
    if not text or not text.strip():
        return []

    parts = [p.strip().lstrip("•▪‣·-– ").strip() for p in _BULLET_SPLIT_RE.split(text)]
    parts = [p for p in parts if p]

    # One long paragraph → split on sentence boundaries instead
    if len(parts) == 1 and len(parts[0].split()) > 30:
        parts = [s.strip() for s in re.split(r"(?<=[.!?])\s+", parts[0]) if s.strip()]

    return parts


def _has_quantification(bullet: str) -> bool:
    for pat in get_quantification_patterns():
        if re.search(pat, bullet, re.I):
            return True
    # Any digit or ₹/₨ currency counts
    if re.search(r"\d|₹", bullet):
        return True
    return False


def _starts_with_action_verb(bullet: str) -> bool:
    words = bullet.split()
    if not words:
        return False
    first = words[0].lower().rstrip(",.;:!?")
    if first in get_action_verbs():
        return True
    # spaCy: accept any leading verb in past tense / base form
    if _SPACY_NLP is not None:
        doc = _SPACY_NLP(bullet[:100])
        if len(doc) > 0 and doc[0].pos_ == "VERB" and doc[0].tag_ in ("VBD", "VB", "VBG"):
            return True
    return False


def _weak_start(bullet: str) -> str | None:
    lowered = bullet.lower().lstrip()
    for phrase in _WEAK_STARTS:
        if lowered.startswith(phrase):
            return phrase
    return None


def _is_passive(bullet: str) -> bool:
    if _SPACY_NLP is not None:
        doc = _SPACY_NLP(bullet)
        return any(tok.dep_ in ("nsubjpass", "auxpass") for tok in doc)
    return bool(_PASSIVE_RE.search(bullet))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def analyze_bullet(bullet: str) -> dict[str, Any]:
    """Analyze a single bullet line and return per-check results + issues."""
    bullet = bullet.strip()
    issues: list[dict[str, str]] = []

    has_quant = _has_quantification(bullet)
    has_verb = _starts_with_action_verb(bullet)
    weak = _weak_start(bullet)
    passive = _is_passive(bullet)

    if weak:
        issues.append({
            "type": "weak_start",
            "message": f'Starts with "{weak}" — replace with a strong action verb '
                       '(e.g. "Led", "Built", "Reduced").',
        })
    elif not has_verb:
        issues.append({
            "type": "no_action_verb",
            "message": "Start with a strong action verb "
                       '(e.g. "Developed", "Designed", "Implemented").',
        })

    if not has_quant:
        issues.append({
            "type": "no_metric",
            "message": "Add a number or metric "
                       '(e.g. "reduced load time by 40%", "served 500+ users").',
        })

    if passive:
        issues.append({
            "type": "passive_voice",
            "message": 'Rewrite in active voice — "Built the API" instead of '
                       '"The API was built".',
        })

    word_count = len(bullet.split())
    if word_count > 30:
        issues.append({
            "type": "too_long",
            "message": f"Bullet is {word_count} words — keep it under ~25 for scannability.",
        })

    return {
        "text": bullet,
        "has_quantification": has_quant,
        "has_action_verb": has_verb and not weak,
        "is_passive": passive,
        "issues": issues,
    }


def analyze_description(text: str) -> dict[str, Any]:
    """Split a description into bullets and analyze each one.

    Returns ``{"bullets": [...], "stats": {...}}`` where stats aggregates
    ratios used both by the editor UI and the ATS scorer.
    """
    bullets = split_bullets(text)
    results = [analyze_bullet(b) for b in bullets]

    total = len(results)
    quant = sum(1 for r in results if r["has_quantification"])
    verbs = sum(1 for r in results if r["has_action_verb"])
    passive = sum(1 for r in results if r["is_passive"])

    return {
        "bullets": results,
        "stats": {
            "total": total,
            "with_quantification": quant,
            "with_action_verb": verbs,
            "passive": passive,
        },
    }
