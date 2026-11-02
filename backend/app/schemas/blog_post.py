from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BlogPostBase(BaseModel):
    title: str
    content: str
    cover_image_id: Optional[int] = None
    published: bool = False


class BlogPostCreate(BlogPostBase):
    slug: Optional[str] = Field(default=None, description="Auto-generated from title if omitted.")


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    cover_image_id: Optional[int] = None
    published: Optional[bool] = None


class BlogPostOut(BlogPostBase):
    id: int
    slug: str
    cover_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogPostListItem(BaseModel):
    """Lighter-weight shape for list views - omits full content."""

    id: int
    title: str
    slug: str
    cover_image_url: Optional[str] = None
    published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

