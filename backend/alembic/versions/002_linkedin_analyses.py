"""Create linkedin_analyses table.

Revision ID: 002_linkedin_analyses
Revises: 001_initial
Create Date: 2026-07-24
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002_linkedin_analyses"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "linkedin_analyses",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("raw_text", sa.Text(), server_default=""),
        sa.Column("sections", sa.Text(), server_default="{}"),
        sa.Column("scores", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index(
        "ix_linkedin_analyses_user_id",
        "linkedin_analyses",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_table("linkedin_analyses")
