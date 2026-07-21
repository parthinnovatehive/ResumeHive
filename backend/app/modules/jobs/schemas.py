from pydantic import BaseModel, Field


class JobSearchRequest(BaseModel):
    what: str = Field(..., min_length=1, description="Job title or keywords")
    where: str = Field(default="", description="Location filter")
    country: str = Field(default="in", description="Country code (in, gb, us, de, fr, br, ca, au)")
    page: int = Field(default=1, ge=1)
    results_per_page: int = Field(default=20, ge=1, le=50)
    salary_min: int | None = Field(default=None, ge=0)
    full_time: bool | None = None
    permanent: bool | None = None
    sort_by: str = Field(default="relevance", pattern="^(relevance|salary|date)$")


class JobCategory(BaseModel):
    label: str
    tag: str


class JobCompany(BaseModel):
    display_name: str


class JobLocation(BaseModel):
    display_name: str
    area: list[str]


class JobListing(BaseModel):
    id: str
    title: str
    company: JobCompany
    location: JobLocation
    description: str
    salary_min: float | None = None
    salary_max: float | None = None
    contract_type: str | None = None
    contract_time: str | None = None
    category: JobCategory | None = None
    redirect_url: str
    created: str


class JobSearchResponse(BaseModel):
    results: list[JobListing]
    count: int
    page: int
    results_per_page: int


class CountryOption(BaseModel):
    code: str
    name: str
