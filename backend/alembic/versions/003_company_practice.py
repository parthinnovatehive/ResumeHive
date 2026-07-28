"""Create company practice tables

Revision ID: 003_company_practice
Revises: 002_linkedin_analyses
Create Date: 2026-07-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003_company_practice"
down_revision: Union[str, None] = "16f4d02963f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False, unique=True),
    )
    op.create_index("ix_companies_slug", "companies", ["slug"], unique=True)

    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("link", sa.String(), nullable=False, unique=True),
        sa.Column("difficulty", sa.String(), nullable=False),
        sa.Column("acceptance_rate", sa.Float(), server_default="0.0"),
    )
    op.create_index("ix_questions_link", "questions", ["link"], unique=True)

    op.create_table(
        "company_question_stats",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("company_id", sa.Integer(), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("time_window", sa.String(), nullable=False),
        sa.Column("frequency", sa.Float(), server_default="0.0"),
        sa.UniqueConstraint("company_id", "question_id", "time_window", name="uq_company_question_time_window"),
    )
    op.create_index("ix_cqs_company_time_window", "company_question_stats", ["company_id", "time_window"])


def downgrade() -> None:
    op.drop_table("company_question_stats")
    op.drop_table("questions")
    op.drop_table("companies")
