from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    college_name = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
