from sqlalchemy import Column, ForeignKey, String, Text

from app.core.database import Base


class SiteSetting(Base):
    __tablename__ = "site_settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=True)
    media_id = Column(
        ForeignKey("media.id", ondelete="SET NULL"), nullable=True, index=True
    )
