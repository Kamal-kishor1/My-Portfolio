from sqlalchemy import Column, Integer, String, ForeignKey

from app.core.database import Base


class SeoMeta(Base):
    __tablename__ = "seo_meta"

    id = Column(Integer, primary_key=True)
    entity_type = Column(String, nullable=False)  # 'project' | 'blog_post' | 'site'
    entity_id = Column(Integer, nullable=True)  # null for site-wide SEO defaults
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    og_image_id = Column(Integer, ForeignKey("media.id"), nullable=True)
