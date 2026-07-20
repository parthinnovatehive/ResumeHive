"""Create users and resumes tables.

Revision ID: 001_initial
Revises:
Create Date: 2026-07-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users table ---
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("college_name", sa.String(), server_default=""),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # --- resumes table ---
    op.create_table(
        "resumes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("full_name", sa.String(), server_default=""),
        sa.Column("email", sa.String(), server_default=""),
        sa.Column("phone", sa.String(), server_default=""),
        sa.Column("location", sa.String(), server_default=""),
        sa.Column("linkedin_url", sa.String(), server_default=""),
        sa.Column("summary", sa.Text(), server_default=""),
        sa.Column("education", sa.Text(), server_default="[]"),
        sa.Column("experience", sa.Text(), server_default="[]"),
        sa.Column("projects", sa.Text(), server_default="[]"),
        sa.Column("skills", sa.Text(), server_default="[]"),
        sa.Column("certifications", sa.Text(), server_default="[]"),
        sa.Column(
            "section_order",
            sa.Text(),
            server_default='["summary","experience","education","projects","skills","certifications"]',
        ),
        sa.Column("ats_score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_resumes_user_id", "resumes", ["user_id"])


def downgrade() -> None:
    op.drop_table("resumes")
    op.drop_table("users")
