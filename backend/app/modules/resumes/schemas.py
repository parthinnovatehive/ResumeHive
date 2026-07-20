from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import Any


# ---------------------------------------------------------------------------
# Nested item schemas (stored as JSON strings in TEXT columns)
# ---------------------------------------------------------------------------


class EducationItem(BaseModel):
    """Single education entry."""

    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""


class ExperienceItem(BaseModel):
    """Single work-experience entry."""

    company: str = ""
    title: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""
    is_current: bool = False


class ProjectItem(BaseModel):
    """Single project entry."""

    name: str = ""
    description: str = ""
    technologies: str = ""
    link: str = ""


# ---------------------------------------------------------------------------
# Resume CRUD schemas
# ---------------------------------------------------------------------------


class ResumeCreate(BaseModel):
    """Payload for creating a new resume.

    All fields are optional so the user starts with a blank resume and fills
    in data incrementally (auto-save via PATCH).
    """

    full_name: str = ""
    email: EmailStr | str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    summary: str = ""
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    projects: list[ProjectItem] = []
    skills: list[str] = []
    certifications: list[str] = []
    section_order: list[str] = [
        "summary",
        "experience",
        "education",
        "projects",
        "skills",
        "certifications",
    ]


class ResumeUpdate(BaseModel):
    """Partial update payload -- every field is optional (for PATCH / auto-save)."""

    full_name: str | None = None
    email: EmailStr | str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    summary: str | None = None
    education: list[EducationItem] | None = None
    experience: list[ExperienceItem] | None = None
    projects: list[ProjectItem] | None = None
    skills: list[str] | None = None
    certifications: list[str] | None = None
    section_order: list[str] | None = None
    jd_text: str | None = None


class ResumeFullUpdate(BaseModel):
    """Full replacement payload for PUT -- all content fields required."""

    full_name: str = ""
    email: EmailStr | str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    summary: str = ""
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    projects: list[ProjectItem] = []
    skills: list[str] = []
    certifications: list[str] = []
    section_order: list[str] = [
        "summary",
        "experience",
        "education",
        "projects",
        "skills",
        "certifications",
    ]


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class ResumeResponse(BaseModel):
    """Single resume returned to the client."""

    id: int
    user_id: int
    full_name: str
    email: str
    phone: str
    location: str
    linkedin_url: str
    summary: str
    education: Any
    experience: Any
    projects: Any
    skills: Any
    certifications: Any
    section_order: Any
    ats_score: int | None
    jd_text: str | None = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class ResumeListItem(BaseModel):
    """Lightweight resume representation for list endpoints."""

    id: int
    full_name: str
    email: str
    ats_score: int | None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class AtsScoreBreakdown(BaseModel):
    """Per-category breakdown for a single scoring dimension.

    ``jd_match`` is present only when a job description was provided —
    the other categories are then scaled down to share 75 points.
    """

    format: float
    contact: float
    keywords: float
    achievements: float
    length: float
    education: float
    jd_match: float | None = None


class AtsScoreMax(BaseModel):
    """Maximum points per category."""

    format: float = 25.0
    contact: float = 10.0
    keywords: float = 25.0
    achievements: float = 25.0
    length: float = 10.0
    education: float = 5.0
    jd_match: float | None = None


class BulletIssue(BaseModel):
    """A single flagged problem on one bullet line."""

    type: str
    message: str


class BulletAnalysis(BaseModel):
    """Per-bullet quality analysis result."""

    text: str
    has_quantification: bool
    has_action_verb: bool
    is_passive: bool
    issues: list[BulletIssue]


class BulletStats(BaseModel):
    """Aggregate counts across all bullets in a description."""

    total: int
    with_quantification: int
    with_action_verb: int
    passive: int


class AnalyzeBulletsRequest(BaseModel):
    """Request body for POST /resumes/analyze-bullets."""

    text: str


class AnalyzeBulletsResponse(BaseModel):
    """Bullet analysis for one description blob."""

    bullets: list[BulletAnalysis]
    stats: BulletStats


# ---------------------------------------------------------------------------
# Upload & parse schemas (Phase 3)
# ---------------------------------------------------------------------------


class ParsedResumeData(BaseModel):
    """Extracted resume fields — same shape as ResumeCreate content."""

    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    summary: str = ""
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    projects: list[ProjectItem] = []
    skills: list[str] = []
    certifications: list[str] = []


class ParseUploadResponse(BaseModel):
    """Result of parsing an uploaded resume file.

    ``confidence`` maps each top-level field to "high" (green — likely
    correct) or "low" (yellow — please verify) for the pre-fill UI.
    """

    data: ParsedResumeData
    confidence: dict[str, str]
    warnings: list[str]
    used_ocr: bool
    detected_sections: list[str]


class MissingKeyword(BaseModel):
    """A JD keyword absent from the resume, with normalized weight (0-1)."""

    keyword: str
    weight: float


class JdMatchResult(BaseModel):
    """Resume-vs-JD comparison details (Phase 4)."""

    similarity: float
    matched_keywords: list[str]
    missing_keywords: list[MissingKeyword]
    match_pct: int


class ScoreRequest(BaseModel):
    """Body for POST /resumes/{id}/score — role and/or pasted JD text."""

    role: str | None = None
    jd_text: str | None = None


class TailorRequest(BaseModel):
    """Body for POST /resumes/{id}/tailor — fork a resume for a specific job."""

    jd_text: str
    title_hint: str | None = None  # e.g. company/role, used only for messaging


class AtsPreviewResponse(BaseModel):
    """Plain-text extraction of the generated PDF — what an ATS parser sees."""

    text: str
    detected_sections: list[str]
    warnings: list[str]


class AtsScoreResponse(BaseModel):
    """Full ATS scoring result with breakdown and suggestions."""

    score: int
    breakdown: AtsScoreBreakdown
    max: AtsScoreMax
    suggestions: list[str]
    jd_match: JdMatchResult | None = None


# ---------------------------------------------------------------------------
# Gap analysis schemas
# ---------------------------------------------------------------------------


class GapAnalysisRequest(BaseModel):
    """Request body for gap analysis."""

    target_role: str
    target_company: str | None = None


class GapItem(BaseModel):
    """A single present or missing item from the taxonomy."""

    item: str
    category: str


class GapMissingItem(BaseModel):
    """A missing item with a suggestion."""

    item: str
    category: str
    suggestion: str


class GapAnalysisResponse(BaseModel):
    """Gap analysis result."""

    role: str
    role_name: str
    total_skills: int
    present_count: int
    coverage_pct: int
    present: list[GapItem]
    missing: list[GapMissingItem]
