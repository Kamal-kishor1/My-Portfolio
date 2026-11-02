"""add featured to projects

Revision ID: 63b15a999335
Revises: 1d36df5aaa0a
Create Date: 2026-08-21 09:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '63b15a999335'
down_revision: Union[str, None] = '1d36df5aaa0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.text("false")))


def downgrade() -> None:
    op.drop_column("projects", "featured")
