"""Add public site settings with safe defaults.

Revision ID: 4f80a2c173b1
Revises: c2e71a4a91b0
Create Date: 2026-11-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4f80a2c173b1"
down_revision: Union[str, None] = "c2e71a4a91b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "site_settings",
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column("media_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["media_id"], ["media.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("key"),
    )
    op.create_index("ix_site_settings_media_id", "site_settings", ["media_id"])

    op.execute(
        sa.text(
            "INSERT INTO site_settings (key, value) VALUES "
            "('contact_email', 'kamalpandey12345coc@gmail.com'), "
            "('linkedin_url', 'https://linkedin.com/in/kamal-kishor'), "
            "('github_url', 'https://github.com/Kamal-kishor1'), "
            "('open_to_work_enabled', 'true'), "
            "('open_to_work_text', 'Open to work · Backend / AI-ML Engineer · India (remote OK)'), "
            "('resume_pdf', NULL) "
            "ON CONFLICT (key) DO NOTHING"
        )
    )


def downgrade() -> None:
    op.drop_index("ix_site_settings_media_id", table_name="site_settings")
    op.drop_table("site_settings")
