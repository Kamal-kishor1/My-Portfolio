"""Remove the remote-work qualifier from the default availability badge.

Revision ID: a5c27d91e682
Revises: 4f80a2c173b1
Create Date: 2026-11-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a5c27d91e682"
down_revision: Union[str, None] = "4f80a2c173b1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE site_settings "
            "SET value = 'Open to work · Backend / AI-ML Engineer · India' "
            "WHERE key = 'open_to_work_text' "
            "AND value = 'Open to work · Backend / AI-ML Engineer · India (remote OK)'"
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            "UPDATE site_settings "
            "SET value = 'Open to work · Backend / AI-ML Engineer · India (remote OK)' "
            "WHERE key = 'open_to_work_text' "
            "AND value = 'Open to work · Backend / AI-ML Engineer · India'"
        )
    )
