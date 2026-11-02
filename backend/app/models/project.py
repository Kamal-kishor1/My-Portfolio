from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.services.object_storage import resolve_media_url


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    summary = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    tech_stack = Column(ARRAY(String), nullable=True)
    repo_url = Column(String, nullable=True)
    live_url = Column(String, nullable=True)
    cover_image_id = Column(Integer, ForeignKey("media.id"), nullable=True)
    published = Column(Boolean, default=False, nullable=False)
    featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    cover_image = relationship("Media", foreign_keys=[cover_image_id], lazy="joined")

    @property
    def cover_image_url(self) -> str | None:
        return (
            resolve_media_url(self.cover_image.url, self.cover_image.storage_key)
            if self.cover_image
            else None
        )
