from typing import Optional

from pydantic import BaseModel


class SeoMetaBase(BaseModel):
    entity_type: str  # 'project' | 'blog_post' | 'site'
    entity_id: Optional[int] = None  # null for site-wide
    title: Optional[str] = None
    description: Optional[str] = None
    og_image_id: Optional[int] = None


class SeoMetaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    og_image_id: Optional[int] = None


class SeoMetaOut(SeoMetaBase):
    id: int

    model_config = {"from_attributes": True}
