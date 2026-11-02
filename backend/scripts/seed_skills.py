"""Idempotently upsert optional skill entries from SKILLS_SEED_JSON."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.resume_entry import ResumeEntry


def seed_skills() -> int:
    records = json.loads(settings.skills_seed_json)
    if not isinstance(records, list) or any(not isinstance(item, str) or not item.strip() for item in records):
        raise ValueError("SKILLS_SEED_JSON must be a JSON array of non-empty strings")
    unique_records = list(dict.fromkeys(item.strip() for item in records))
    with SessionLocal() as db:
        for index, title in enumerate(unique_records):
            skill = db.query(ResumeEntry).filter(ResumeEntry.type == "skill", ResumeEntry.title == title).first()
            if skill is None:
                db.add(ResumeEntry(type="skill", title=title.strip(), sort_order=index))
            else:
                skill.sort_order = index
        db.commit()
    return len(unique_records)


if __name__ == "__main__":
    print(f"Skill seed records processed: {seed_skills()}")
