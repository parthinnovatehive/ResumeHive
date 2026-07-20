"""
Job-description matching (Phase 4).

Compares a resume against a pasted job description:
    - TF-IDF vectorization (unigrams + bigrams) over the JD, with the
      resume scored in the same vector space.
    - Cosine similarity between resume text and JD text (0.0 - 1.0).
    - Missing keywords: top JD n-grams NOT present in the resume, ranked
      by TF-IDF weight — shown as "add these if genuinely true of you".

Uses scikit-learn when available; falls back to a pure-Python TF
implementation otherwise (same output shape, slightly coarser ranking).
Rule-based only — no LLM involved.
"""

from __future__ import annotations

import logging
import math
import re
from collections import Counter
from typing import Any

logger = logging.getLogger(__name__)

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    _SKLEARN = True
except ImportError:
    _SKLEARN = False
    logger.debug("scikit-learn not installed; using pure-Python TF fallback.")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_JD_LENGTH = 20_000  # chars

# Generic JD boilerplate that should never be suggested as a "keyword"
_STOPWORDS = frozenset("""
a about above after all also am an and any are as at be because been before
being below between both but by can could did do does doing down during each
few for from further had has have having he her here hers herself him himself
his how i if in into is it its itself just me more most my myself no nor not
now of off on once only or other our ours ourselves out over own same she
should so some such than that the their theirs them themselves then there
these they this those through to too under until up very was we were what
when where which while who whom why will with you your yours yourself
yourselves
job description role position candidate candidates applicant applicants
company team work working experience experienced years year required
requirements requirement responsibilities responsibility qualifications
qualification preferred plus bonus ability able strong excellent good great
knowledge skills skill familiarity familiar proficiency proficient
understanding opportunity opportunities looking seeking join apply
applications benefits salary location remote hybrid onsite etc including
include includes must should would like well new using use minimum ideal
""".split())

_TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z+#.]*[a-zA-Z+#]|[a-zA-Z]")

# Bigrams must not span sentence/line/list boundaries — "version control.
# Nice to have" must never produce "control nice".
_SEGMENT_SPLIT_RE = re.compile(r"[\n\r.;:!?,()•▪\[\]{}|/]+")

# How many missing keywords to surface at most
_MAX_MISSING = 15
_MAX_MATCHED = 25


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _tokenize(text: str) -> list[str]:
    """Lowercase word tokens, keeping tech-relevant chars (C++, C#, node.js)."""
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def _ngrams(tokens: list[str], n: int) -> list[str]:
    return [" ".join(tokens[i : i + n]) for i in range(len(tokens) - n + 1)]


def _candidate_terms(text: str) -> list[str]:
    """Unigrams + bigrams, generated per punctuation-bounded segment so
    bigrams never span sentence/line/list boundaries. Stopword-containing
    grams are dropped. Used both as the sklearn analyzer and the fallback."""
    terms: list[str] = []
    for segment in _SEGMENT_SPLIT_RE.split(text):
        tokens = _tokenize(segment)
        terms.extend(t for t in tokens if t not in _STOPWORDS and len(t) > 1)
        terms.extend(
            g for g in _ngrams(tokens, 2)
            if all(w not in _STOPWORDS and len(w) > 1 for w in g.split())
        )
    return terms


def _normalize_for_match(text: str) -> str:
    """Lowercased text with separators collapsed, for substring checks."""
    return re.sub(r"[\s/,;|-]+", " ", text.lower())


def _term_in_resume(term: str, resume_norm: str) -> bool:
    """Whole-word(ish) presence check, tolerating plural/suffix variants.

    "api" matches "APIs", "pipeline" matches "pipelines", and vice versa —
    a keyword shouldn't be flagged missing over an 's'.
    """
    core = term[:-1] if term.endswith("s") and len(term) > 3 else term
    pattern = r"(?<![a-z0-9])" + re.escape(core) + r"(?:e?s)?(?![a-z0-9])"
    return re.search(pattern, resume_norm) is not None


# ---------------------------------------------------------------------------
# TF-IDF ranking of JD terms
# ---------------------------------------------------------------------------


def _rank_jd_terms_sklearn(jd_text: str, resume_text: str) -> tuple[list[tuple[str, float]], float]:
    """Rank JD terms by TF-IDF weight; also compute cosine similarity.

    The vectorizer is fit on both documents so IDF distinguishes terms
    that appear only in the JD (the interesting gap) from shared ones.
    """
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words=list(_STOPWORDS),
        token_pattern=r"[a-zA-Z][a-zA-Z+#.]*[a-zA-Z+#]|[a-zA-Z]",
        lowercase=True,
        max_features=2000,
    )
    try:
        matrix = vectorizer.fit_transform([jd_text, resume_text])
    except ValueError:
        # JD was all stopwords / empty after filtering
        return [], 0.0

    similarity = float(cosine_similarity(matrix[0], matrix[1])[0][0])

    feature_names = vectorizer.get_feature_names_out()
    jd_weights = matrix[0].toarray()[0]
    # On weight ties, prefer bigrams ("ci cd") over their fragments ("ci", "cd")
    ranked = sorted(
        ((feature_names[i], float(jd_weights[i])) for i in range(len(feature_names)) if jd_weights[i] > 0),
        key=lambda kv: (kv[1], len(kv[0].split())),
        reverse=True,
    )
    return ranked, similarity


def _rank_jd_terms_fallback(jd_text: str, resume_text: str) -> tuple[list[tuple[str, float]], float]:
    """Pure-Python TF ranking + cosine similarity over term counts."""
    jd_terms = _candidate_terms(jd_text)
    resume_terms = _candidate_terms(resume_text)
    if not jd_terms:
        return [], 0.0

    jd_counts = Counter(jd_terms)
    resume_counts = Counter(resume_terms)

    # Cosine similarity over the shared vocabulary
    vocab = set(jd_counts) | set(resume_counts)
    dot = sum(jd_counts[t] * resume_counts[t] for t in vocab)
    norm_jd = math.sqrt(sum(c * c for c in jd_counts.values()))
    norm_res = math.sqrt(sum(c * c for c in resume_counts.values()))
    similarity = dot / (norm_jd * norm_res) if norm_jd and norm_res else 0.0

    total = sum(jd_counts.values())
    ranked = sorted(
        ((term, count / total) for term, count in jd_counts.items()),
        key=lambda kv: (kv[1], len(kv[0].split())),
        reverse=True,
    )
    return ranked, similarity


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def match_jd(resume_text: str, jd_text: str) -> dict[str, Any]:
    """Match a resume against a job description.

    Returns::

        {
            "similarity": float,          # 0.0 - 1.0 cosine similarity
            "matched_keywords": [str],    # top JD terms found in resume
            "missing_keywords": [         # top JD terms NOT in resume
                {"keyword": str, "weight": float},  # weight normalized 0-1
            ],
            "match_pct": int,             # matched / (matched+missing) top terms
        }
    """
    jd_text = (jd_text or "").strip()[:MAX_JD_LENGTH]
    resume_text = (resume_text or "").strip()
    if not jd_text or not resume_text:
        return {
            "similarity": 0.0,
            "matched_keywords": [],
            "missing_keywords": [],
            "match_pct": 0,
        }

    if _SKLEARN:
        ranked, similarity = _rank_jd_terms_sklearn(jd_text, resume_text)
    else:
        ranked, similarity = _rank_jd_terms_fallback(jd_text, resume_text)

    resume_norm = _normalize_for_match(resume_text)

    # Pass 1 — matched terms first, so a matched unigram ("aws") suppresses
    # noisy bigram variants ("aws deployment") from the missing list.
    matched: list[str] = []
    matched_words: set[str] = set()
    for term, _weight in ranked:
        words = set(term.split())
        if words & matched_words:
            continue
        if _term_in_resume(term, resume_norm):
            matched.append(term)
            matched_words |= words
            if len(matched) >= _MAX_MATCHED:
                break

    # Pass 2 — missing terms, skipping anything already covered by a match
    missing: list[tuple[str, float]] = []
    seen_words = set(matched_words)
    for term, weight in ranked:
        words = set(term.split())
        if words & seen_words:
            continue
        if not _term_in_resume(term, resume_norm):
            missing.append((term, weight))
            seen_words |= words
            if len(missing) >= _MAX_MISSING:
                break

    top_total = len(matched) + len(missing)
    match_pct = round(100 * len(matched) / top_total) if top_total else 0

    max_w = missing[0][1] if missing else 1.0
    return {
        "similarity": round(similarity, 3),
        "matched_keywords": matched,
        "missing_keywords": [
            {"keyword": term, "weight": round(w / max_w, 2) if max_w else 0.0}
            for term, w in missing
        ],
        "match_pct": match_pct,
    }
