from pydantic import BaseModel


class LinkedinSections(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    linkedin_url: str = ""
    headline: str = ""
    location: str = ""
    about: str = ""
    experience: list[dict] = []
    education: list[dict] = []
    skills: list[str] = []
    certifications: list[str] = []
    detected_sections: list[str] = []
    warnings: list[str] = []


class LinkedinAnalysisResponse(BaseModel):
    id: int
    raw_text: str
    sections: LinkedinSections
    scores: dict | None = None
    created_at: str


class LinkedinAnalysisListItem(BaseModel):
    id: int
    created_at: str
    detected_sections: list[str] = []
    warnings: list[str] = []


class LinkedinRewriteResult(BaseModel):
    original: str
    rewritten: str
    rewrite_type: str
