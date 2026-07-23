from collections.abc import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async_engine = create_async_engine(
    settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    if settings.DATABASE_URL.startswith("sqlite")
    else settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
)

AsyncSessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=async_engine, class_=AsyncSession
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
