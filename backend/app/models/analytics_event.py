from sqlalchemy import Column, Integer, String, DateTime, func

from app.core.database import Base


class AnalyticsEvent(Base):
    """Deprecated legacy table retained to preserve existing migration data."""

    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True)
    path = Column(String, nullable=False)
    referrer = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
