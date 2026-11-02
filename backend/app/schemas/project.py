from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    title: str
    summary: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image_id: Optional[int] = None
    published: bool = False
    featured: bool = False


class ProjectCreate(ProjectBase):
    slug: Optional[str] = Field(
        default=None,
        description="Auto-generated from title if omitted.",
    )


class ProjectUpdate(BaseModel):
    """All fields optional - PATCH semantics, only provided fields are updated."""

    title: Optional[str] = None
    slug: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    repo_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image_id: Optional[int] = None
    published: Optional[bool] = None
    featured: Optional[bool] = None


class ProjectOut(ProjectBase):
    id: int
    slug: str
    cover_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # lets .model_validate() read straight from the ORM object

