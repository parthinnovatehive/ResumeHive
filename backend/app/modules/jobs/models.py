from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import TypeDecorator

from app.db.base import Base


class JSONVariant(TypeDecorator):
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(JSONB())
        if dialect.name == "sqlite":
            return dialect.type_descriptor(SQLiteJSON())
        return dialect.type_descriptor(Text())


class JobSearchCache(Base):
    __tablename__ = "job_search_cache"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    query_key: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    results: Mapped[dict] = mapped_column(JSONVariant, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    __table_args__ = (
        Index("ix_job_search_cache_query_key", "query_key", unique=True),
        Index("ix_job_search_cache_expires_at", "expires_at"),
    )