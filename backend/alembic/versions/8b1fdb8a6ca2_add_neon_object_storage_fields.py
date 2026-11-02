"""Add Neon Object Storage metadata to media records.

Revision ID: 8b1fdb8a6ca2
Revises: 63b15a999335
Create Date: 2026-11-02
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8b1fdb8a6ca2"
down_revision: Union[str, None] = "63b15a999335"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("media", sa.Column("storage_key", sa.String(), nullable=True))
    op.add_column("media", sa.Column("content_type", sa.String(), nullable=True))
    op.create_index(
        op.f("ix_media_storage_key"), "media", ["storage_key"], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_media_storage_key"), table_name="media")
    op.drop_column("media", "content_type")
    op.drop_column("media", "storage_key")
