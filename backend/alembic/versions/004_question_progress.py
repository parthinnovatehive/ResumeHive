"""Create question_progress table

Revision ID: 004_question_progress
Revises: 003_company_practice
Create Date: 2026-07-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004_question_progress"
down_revision: Union[str, None] = "003_company_practice"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "question_progress",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("revisit_later", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "question_id", name="uq_user_question"),
    )
    op.create_index("ix_qp_user_status", "question_progress", ["user_id", "status"])


def downgrade() -> None:
    op.drop_table("question_progress")
