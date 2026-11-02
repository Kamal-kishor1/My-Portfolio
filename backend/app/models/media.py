from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func

from app.core.database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    storage_key = Column(String, nullable=True, unique=True, index=True)
    content_type = Column(String, nullable=True)
    alt_text = Column(String, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
