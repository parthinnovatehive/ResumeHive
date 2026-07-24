"""
LinkedIn PDF export parsing (Phase 1).

Extracts raw text from a LinkedIn profile PDF export and splits it into
structured sections (headline, about, experience, education, skills, etc.)

LinkedIn PDF exports use a fairly consistent layout:
- The first ~5 lines are the profile header (name, headline, location)
- Followed by "About" / "Experience" / "Education" / "Skills" section headers
- Section headers are typically ALL CAPS or Title Case, standalone lines
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional dependencies
# ---------------------------------------------------------------------------

_SPACY_NLP = None
try:
    import spacy as _spacy_mod

    try:
        _SPACY_NLP = _spacy_mod.load("en_core_web_sm")
    except Exception:
        logger.debug("spaCy model not installed; NER extraction disabled.")
except ImportError:
    pass

try:
    from rapidfuzz import fuzz as _fuzz
except ImportError:
    _fuzz = None

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

# LinkedIn standard export section headers (lowercase for matching).
# These are the most common headers across LinkedIn PDF export versions.
_LINKEDIN_SECTIONS: dict[str, list[str]] = {
    "about": [
        "about",
        "about this person",
        "about me",
        "summary",
    ],
    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment",
    ],
    "education": [
        "education",
    ],
    "skills": [
        "skills",
        "skills & endorsements",
        "skills and endorsements",
    ],
    "certifications": [
        "licenses & certifications",
        "licenses and certifications",
        "certifications",
        "licenses",
    ],
    "recommendations": [
        "recommendations",
        "recommendations received",
    ],
    "interests": [
        "interests",
    ],
    # Sidebar headers — recognized as valid stop-boundaries but their
    # content is not stored.  This prevents unknown headers from silently
    # absorbing content into the previous section (the same failure mode
    # that caused the Certifications-garbage bug).
    "contact": [
        "contact",
        "contact info",
        "contact information",
    ],
    "top_skills": [
        "top skills",
    ],
}

# Sections whose content we detect as boundaries but discard.
_SKIP_SECTIONS = {"contact", "top_skills"}

_HEADER_MATCH_THRESHOLD = 82

# Date pattern: "Jan 2020 - Present", "2019 - 2021", etc.
_MONTHS = (
    "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|"
    "jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?"
)
_DATE_TOKEN = rf"(?:(?:{_MONTHS})[a-z]*\.?\s*)?(?:19|20)\d{{2}}"
_DATE_RANGE_RE = re.compile(
    rf"({_DATE_TOKEN})\s*(?:-|–|—|to)\s*({_DATE_TOKEN}|present|current|now|ongoing)",
    re.I,
)


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------


def _extract_ordered_columns(page, column_split_ratio: float = 0.32) -> tuple[str, str]:
    """Extract text from a page split into left sidebar and main column.

    LinkedIn PDF exports use a two-column layout: a narrow left sidebar
    (Contact, Top Skills, Certifications preview) and the main content
    column (Name, Headline, About, Experience, Education, etc.).

    PyMuPDF's ``get_text("text")`` does not respect this layout and
    interleaves content from both columns.  Block-level extraction with
    positional sorting fixes this.

    Returns ``(left_text, main_text)``.
    """
    page_width = page.rect.width
    split_x = page_width * column_split_ratio

    blocks = page.get_text("blocks")  # (x0, y0, x1, y1, text, block_no, block_type)
    left_col = [b for b in blocks if b[0] < split_x]
    main_col = [b for b in blocks if b[0] >= split_x]

    left_col.sort(key=lambda b: b[1])   # sort by y0
    main_col.sort(key=lambda b: b[1])

    left_text = "\n".join(b[4] for b in left_col if b[4].strip())
    main_text = "\n".join(b[4] for b in main_col if b[4].strip())
    return left_text, main_text


def extract_text_from_pdf(data: bytes) -> str:
    """Extract text from a LinkedIn PDF export using PyMuPDF.

    Uses column-aware block extraction so sidebar content (Contact,
    Top Skills, Certifications preview) does not bleed into the main
    content column.  Only the main column text is returned for
    section splitting.
    """
    import fitz

    main_chunks: list[str] = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            _left_text, main_text = _extract_ordered_columns(page)
            if main_text.strip():
                main_chunks.append(main_text)
    return "\n".join(main_chunks)


def _extract_contact_from_pdf(data: bytes) -> dict[str, str]:
    """Extract profile identity and contact details from both PDF columns."""
    import fitz

    left_chunks: list[str] = []
    main_chunks: list[str] = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            left_text, main_text = _extract_ordered_columns(page)
            left_chunks.append(left_text)
            main_chunks.append(main_text)

    left_text = "\n".join(left_chunks)
    main_text = "\n".join(main_chunks)
    all_lines = [line.strip() for line in main_text.splitlines() if line.strip()]
    combined_text = left_text + "\n" + main_text
    normalized_contact_text = re.sub(r"[\s\u00ad\u2010-\u2015\ufeff\ufffe]+", "", combined_text)

    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", combined_text)
    if not email_match:
        lines = combined_text.splitlines()
        at_idx = -1
        for i, ln in enumerate(lines):
            if "@" in ln:
                at_idx = i
                break
        if at_idx >= 0:
            buf = lines[at_idx].strip()
            best = None
            for j in range(at_idx + 1, len(lines)):
                nxt = lines[j].strip()
                if not nxt or not re.fullmatch(r"[\w.-]+", nxt):
                    break
                buf += nxt
                m = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", buf)
                if m:
                    best = m
            email_match = best
    linkedin_match = re.search(
        r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w%-]+/?",
        normalized_contact_text,
        re.I,
    )
    phone_match = re.search(r"(?<!\d)(?:\+?\d[\d ()-]{7,}\d)(?!\d)", left_text)

    full_name = ""
    for line in all_lines:
        words = line.split()
        if 2 <= len(words) <= 6 and not any(ch.isdigit() for ch in line):
            if not re.search(r"@|linkedin\.com|^(?:summary|experience|education)$", line, re.I):
                full_name = line
                break

    return {
        "full_name": full_name,
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0).strip() if phone_match else "",
        "linkedin_url": linkedin_match.group(0) if linkedin_match else "",
    }


def _extract_sidebar_profile_fields(data: bytes) -> dict[str, str]:
    """Extract the sidebar-only Top Skills and Certifications values."""
    import fitz

    sidebar_lines: list[str] = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            left_text, _main_text = _extract_ordered_columns(page)
            sidebar_lines.extend(line.strip() for line in left_text.splitlines() if line.strip())

    sections: dict[str, list[str]] = {"top_skills": [], "certifications": []}
    current: str | None = None
    for line in sidebar_lines:
        normalized = line.lower().strip().strip(":")
        if normalized == "top skills":
            current = "top_skills"
            continue
        if normalized in {"certifications", "licenses & certifications", "licenses and certifications"}:
            current = "certifications"
            continue
        if normalized in {"contact", "contact info", "contact information"}:
            current = None
            continue
        if current:
            sections[current].append(line)

    top_skills = _extract_skills("\n".join(sections["top_skills"]))
    certifications = _extract_certifications("\n".join(sections["certifications"]))
    return {
        "top_skills": ", ".join(top_skills),
        "certifications_csv": ", ".join(certifications),
    }


# ---------------------------------------------------------------------------
# Footer / noise filtering
# ---------------------------------------------------------------------------

_FOOTER_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"^Page \d+ of \d+\s*$", re.I),
    re.compile(r"^www\.linkedin\.com/in/\S+\s*$", re.I),
    re.compile(r"^https?://www\.linkedin\.com/in/\S+\s*$", re.I),
    re.compile(r"^\d{1,3}$"),  # bare page numbers
]


def _strip_footer_noise(text: str) -> str:
    """Remove footer artefacts (page numbers, LinkedIn URLs, etc.)."""
    lines = text.splitlines()
    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        if any(p.search(stripped) for p in _FOOTER_PATTERNS):
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


# ---------------------------------------------------------------------------
# Section detection
# ---------------------------------------------------------------------------


def _match_linkedin_header(line: str) -> str | None:
    """Return the canonical section key if the line is a LinkedIn section header."""
    stripped = line.strip().strip(":").strip()
    if not stripped or len(stripped) > 50:
        return None

    lowered = stripped.lower()

    for section, aliases in _LINKEDIN_SECTIONS.items():
        for alias in aliases:
            if lowered == alias:
                return section
            if _fuzz is not None and _fuzz.ratio(lowered, alias) >= _HEADER_MATCH_THRESHOLD:
                return section
    return None


def split_linkedin_sections(text: str) -> dict[str, str]:
    """Split raw LinkedIn PDF text into ``{section: full_text}``.

    The header area (name, headline, location) before the first section
    header is stored under ``_header``.

    Sidebar sections (contact, top_skills) are recognized as valid
    stop-boundaries but their content is discarded — they live in the
    left column and would otherwise pollute the main content.

    Returns section values as cleaned multi-line strings, not line lists.
    """
    sections: dict[str, list[str]] = {"_header": []}
    current = "_header"
    in_skip = False

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        matched = _match_linkedin_header(line)
        if matched:
            if matched in _SKIP_SECTIONS:
                in_skip = True
                current = matched
            else:
                in_skip = False
                current = matched
                sections.setdefault(current, [])
            continue

        if not in_skip:
            sections.setdefault(current, []).append(line)

    # Collapse line lists into clean strings, dropping skip sections
    return {
        k: "\n".join(v).strip()
        for k, v in sections.items()
        if k not in _SKIP_SECTIONS
    }


# ---------------------------------------------------------------------------
# Structured extraction from sections
# ---------------------------------------------------------------------------


def _extract_headline(header_text: str) -> str:
    """Extract the professional headline from the header block.

    LinkedIn exports typically have:
        Line 1: Full Name
        Line 2: Professional headline (the target)
        Line 3: Location | Connections
        Line 4+: empty or email/phone
    """
    lines = [l.strip() for l in header_text.splitlines() if l.strip()]
    if len(lines) >= 2:
        return lines[1]
    return ""


def _extract_headline_location(header_text: str) -> tuple[str, str]:
    """Extract headline and location anchored on the profile name.

    Instead of blindly assuming line 2 is the headline, this finds the
    student's name explicitly and takes the next non-empty line as the
    headline, and the one after that as the location (if it isn't a
    section header).
    """
    lines = [l.strip() for l in header_text.splitlines() if l.strip()]
    headline = ""
    location = ""

    # Skip lines that look like contact info or section headers
    _skip_re = re.compile(
        r"(?:@|\.com|linkedin\.com|http|email|phone|\d{5,}|"
        r"^about$|^experience$|^education$|^skills$|^contact$)",
        re.I,
    )

    def _looks_like_location(candidate: str) -> bool:
        return bool(
            re.match(r"^[A-Za-z .'-]+,\s*[A-Za-z .'-]+(?:,\s*[A-Za-z .'-]+)?$", candidate)
            and 1 <= candidate.count(",") <= 2
            and len(candidate) <= 100
        )

    for i, line in enumerate(lines):
        # A name line: 2-5 words, no digits, no URLs, no contact patterns
        words = line.split()
        if (
            2 <= len(words) <= 5
            and not any(ch.isdigit() for ch in line)
            and not _skip_re.search(line)
        ):
            # LinkedIn wraps long headlines; stop only at location or a section boundary.
            headline_lines: list[str] = []
            for candidate in lines[i + 1:]:
                if _match_linkedin_header(candidate) or candidate.lower() == "summary":
                    break
                if _looks_like_location(candidate):
                    location = candidate
                    break
                if _skip_re.search(candidate):
                    break
                headline_lines.append(candidate)
            headline = " ".join(headline_lines).strip()
            break

    # Fallback: if no name found, use positional heuristic
    if not headline and len(lines) >= 2:
        headline = lines[1]
    if not location and len(lines) >= 3:
        candidate = lines[2]
        if not _skip_re.search(candidate):
            location = candidate

    return headline, location


_DURATION_TOTAL_RE = re.compile(
    r"^\d+\s+years?(?:\s+\d+\s+months?)?$|^\d+\s+months?$", re.I
)
_ROLE_WORDS_RE = re.compile(
    r"\b(?:intern|developer|engineer|designer|analyst|manager|director|lead|"
    r"consultant|specialist|administrator|presenter|architect|scientist|"
    r"researcher|coordinator|assistant|student|trainee|founder|back\s+end|"
    r"front\s*end|full\s*stack)\b",
    re.I,
)
_COMPANY_WORDS_RE = re.compile(
    r"\b(?:pvt\.?|private|limited|ltd\.?|technologies|technology|unstop|"
    r"mentor|inc\.?|corp\.?|llc|university|college)\b",
    re.I,
)


def _looks_like_role_title(line: str) -> bool:
    """Recognize common role-title wording without requiring a fixed dictionary."""
    return (
        (bool(_ROLE_WORDS_RE.search(line)) or line.strip().lower() in {"itern", "intern"})
        and len(line) <= 100
        and "." not in line
    )


def _looks_like_company_header(line: str, title: str) -> bool:
    """Identify a repeated company header before a title/date pair."""
    if not line or _DURATION_TOTAL_RE.fullmatch(line) or _DATE_RANGE_RE.search(line):
        return False
    if not _looks_like_role_title(title) or _looks_like_role_title(line):
        return False
    if _COMPANY_WORDS_RE.search(line):
        return True
    return line[0].isupper() and len(line.split()) <= 8


def _extract_about(about_text: str) -> str:
    """Clean and return the About section text."""
    return about_text.strip()


def _extract_experience_entries(experience_text: str) -> list[dict[str, Any]]:
    """Parse experience section into structured entries.

    LinkedIn experience entries typically follow:
        Title
        Company · Full-time
        Start Date - End Date
        Location (optional)
        Description bullets...
    """
    if not experience_text.strip():
        return []

    entries: list[dict[str, Any]] = []
    lines = [l.strip() for l in experience_text.splitlines() if l.strip()]
    lines = [line for line in lines if not _DURATION_TOTAL_RE.fullmatch(line)]
    date_indexes = [i for i, line in enumerate(lines) if _DATE_RANGE_RE.search(line)]
    current_company = ""
    headers: list[tuple[int, str, str, str]] = []

    for date_index in date_indexes:
        if date_index == 0:
            continue
        title = lines[date_index - 1].split("·")[0].strip()
        company = current_company
        if date_index >= 2:
            candidate_company = lines[date_index - 2].split("·")[0].strip()
            if not current_company or _looks_like_company_header(candidate_company, title):
                company = candidate_company
                current_company = candidate_company
        headers.append((date_index, title, company, lines[date_index]))

    for header_index, (date_index, title, company, date_range) in enumerate(headers):
        next_header_index = headers[header_index + 1][0] if header_index + 1 < len(headers) else len(lines)
        description_end = next_header_index - 1
        if header_index + 1 < len(headers):
            next_title_index = next_header_index - 1
            description_end = next_title_index - 1
            if next_title_index >= 1 and _looks_like_company_header(
                lines[next_title_index - 1], lines[next_title_index]
            ):
                description_end = next_title_index - 2
        desc_lines = lines[date_index + 1:description_end + 1]
        entries.append({
            "title": title,
            "company": company,
            "date_range": date_range.strip(),
            "description": "\n".join(desc_lines),
        })

    # Fallback: if no date-anchored entries found, return the whole block as one entry
    if not entries and experience_text.strip():
        entries.append({
            "title": "",
            "company": "",
            "date_range": "",
            "description": experience_text.strip(),
        })

    return entries


def _extract_education_entries(education_text: str) -> list[dict[str, str]]:
    """Parse education section into structured entries.

    Handles line-wrapping where a degree or institution spans multiple
    lines (e.g. "B.Tech in Computer" on one line, "Engineering" on the
    next) by merging continuation lines into the previous entry.
    """
    if not education_text.strip():
        return []

    _degree_re = re.compile(
        r"(?:Bachelor|Master|B\.?\s?Tech|M\.?\s?Tech|BSc|MSc|Diploma|B\.?E\.?|M\.?E\.?|"
        r"B\.?\s?Com|M\.?\s?Com|BCA|MCA|BBA|MBA|Ph\.?D)",
        re.I,
    )
    lines = [l.strip() for l in education_text.splitlines() if l.strip()]
    normalized = " ".join(lines)
    date_matches = list(_DATE_RANGE_RE.finditer(normalized))
    entries: list[dict[str, str]] = []
    cursor = 0
    for date_m in date_matches:
        info = normalized[cursor:date_m.start()].strip(" -–—·,|")
        info = re.sub(r"\(\s*\)", "", info).strip(" -–—·,|")
        info = re.sub(r"^[()]|[()]$", "", info).strip(" -–—·,|")
        if info:
            entries.append({
                "info": info,
                "date_range": date_m.group(0).strip(),
            })
        cursor = date_m.end()

    if not entries and education_text.strip():
        entries.append({"info": education_text.strip(), "date_range": ""})

    return entries


def _extract_skills(skills_text: str) -> list[str]:
    """Extract individual skills from the skills section."""
    if not skills_text.strip():
        return []

    skills: list[str] = []
    for line in skills_text.splitlines():
        line = line.strip()
        if not line:
            continue
        # LinkedIn skills are typically one per line, sometimes with endorsement counts
        # Remove trailing numbers/endorsement counts
        cleaned = re.sub(r"\s*\d+\s*endorsements?$", "", line, flags=re.I).strip()
        cleaned = re.sub(r"\s*-\s*\d+$", "", cleaned).strip()
        if cleaned and len(cleaned) <= 80:
            skills.append(cleaned)

    # Dedupe preserving order
    seen: set[str] = set()
    out: list[str] = []
    for s in skills:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            out.append(s)
    return out


def _extract_certifications(cert_text: str) -> list[str]:
    """Extract individual certifications."""
    if not cert_text.strip():
        return []
    page_re = re.compile(r"^page\s+\d+\s+of\s+\d+$", re.I)
    certs: list[str] = []
    for line in cert_text.splitlines():
        line = line.strip()
        if line and len(line) <= 120 and not page_re.match(line):
            certs.append(line)
    return certs


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def parse_linkedin_pdf(data: bytes, filename: str) -> dict[str, Any]:
    """Parse an uploaded LinkedIn PDF export into structured sections.

    Returns::

        {
            "raw_text": str,
            "sections": {
                "headline": str,
                "about": str,
                "experience": [...],
                "education": [...],
                "skills": [...],
                "certifications": [...],
            },
            "detected_sections": [str, ...],
            "warnings": [str, ...],
        }

    Raises ``ValueError`` for unsupported/unreadable files.
    """
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext != ".pdf":
        raise ValueError("Unsupported file type. Please upload a LinkedIn PDF export.")

    if len(data) > MAX_FILE_SIZE:
        raise ValueError("File too large. Maximum size is 5 MB.")

    try:
        raw_text = extract_text_from_pdf(data)
    except Exception as exc:
        logger.warning("LinkedIn PDF parse failed for %s: %s", filename, exc)
        raise ValueError("Could not read this PDF file. Is it a valid LinkedIn export?") from exc

    if not raw_text.strip():
        raise ValueError("No text could be extracted from this PDF.")

    # Strip footer noise before section splitting
    raw_text = _strip_footer_noise(raw_text)

    # Split into sections
    raw_sections = split_linkedin_sections(raw_text)

    # Detect which LinkedIn sections were found
    linkedin_keys = [k for k in raw_sections if k not in ("_header",)]
    warnings: list[str] = []

    if not linkedin_keys:
        warnings.append(
            "No standard LinkedIn section headers were detected. "
            "The text was imported but may need manual review."
        )

    # Extract structured data from each section
    header_text = raw_sections.get("_header", "")
    headline, location = _extract_headline_location(header_text)
    contact = _extract_contact_from_pdf(data)
    sidebar_fields = _extract_sidebar_profile_fields(data)
    if not contact["full_name"]:
        contact["full_name"] = next(
            (line.strip() for line in header_text.splitlines() if line.strip()), ""
        )
    about = _extract_about(raw_sections.get("about", ""))
    experience = _extract_experience_entries(raw_sections.get("experience", ""))
    education = _extract_education_entries(raw_sections.get("education", ""))
    skills = _extract_skills(raw_sections.get("skills", ""))
    certifications = _extract_certifications(raw_sections.get("certifications", ""))

    if not headline:
        warnings.append("Could not detect a headline from the profile header.")

    return {
        "raw_text": raw_text,
        "sections": {
            **contact,
            **sidebar_fields,
            "headline": headline,
            "location": location,
            "about": about,
            "experience": experience,
            "education": education,
            "skills": skills,
            "certifications": certifications,
        },
        "detected_sections": linkedin_keys,
        "warnings": warnings,
    }
