from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""

    success: bool
    data: T | None = None
    message: str = ""


class PaginatedData(BaseModel, Generic[T]):
    """Paginated list wrapper used inside ApiResponse.data."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 20


class ErrorResponse(BaseModel):
    detail: str
