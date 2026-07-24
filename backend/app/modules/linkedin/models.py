from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class LinkedinAnalysis(Base):
    """LinkedIn profile analysis from an uploaded PDF export.

    Stores the raw extracted text, parsed sections as JSON, and computed
    scores — all scoped to a single user upload event.
    """

    __tablename__ = "linkedin_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_text = Column(Text, default="")
    sections = Column(Text, default="{}")
    scores = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="linkedin_analyses")
