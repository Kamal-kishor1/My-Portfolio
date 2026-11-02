from sqlalchemy import Column, Integer, String, Text, Date

from app.core.database import Base


class ResumeEntry(Base):
    __tablename__ = "resume_entries"

    id = Column(Integer, primary_key=True)
    type = Column(String, nullable=False)  # 'experience' | 'education' | 'skill'
    title = Column(String, nullable=False)
    organization = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)  # null = ongoing
    sort_order = Column(Integer, default=0, nullable=False)
