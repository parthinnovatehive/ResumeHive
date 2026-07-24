"""add linkedin profile fields to user

Revision ID: 16f4d02963f2
Revises: 002_linkedin_analyses
Create Date: 2026-07-25 01:54:48.852306
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '16f4d02963f2'
down_revision: Union[str, None] = '002_linkedin_analyses'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('linkedin_url', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('linkedin_id', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('headline', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('about', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('top_skills', sa.Text(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('certifications', sa.Text(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('experience', sa.Text(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('education', sa.Text(), nullable=True, server_default='[]'))
        batch_op.add_column(sa.Column('linkedin_profile_stored', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('linkedin_profile_stored')
        batch_op.drop_column('education')
        batch_op.drop_column('experience')
        batch_op.drop_column('certifications')
        batch_op.drop_column('top_skills')
        batch_op.drop_column('about')
        batch_op.drop_column('headline')
        batch_op.drop_column('linkedin_id')
        batch_op.drop_column('linkedin_url')
