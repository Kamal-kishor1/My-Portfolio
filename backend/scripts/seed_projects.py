"""Idempotently upsert optional project content from PROJECTS_SEED_JSON."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.slugify import slugify
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.project_service import create_project, update_project


def seed_projects() -> int:
    records = json.loads(settings.projects_seed_json)
    if not isinstance(records, list):
        raise ValueError("PROJECTS_SEED_JSON must be a JSON array")
    changed = 0
    with SessionLocal() as db:
        for record in records:
            payload = ProjectCreate.model_validate(record)
            stable_slug = slugify(payload.slug or payload.title)
            existing = db.query(Project).filter(Project.slug == stable_slug).one_or_none()
            if existing:
                update_project(db, existing.id, ProjectUpdate(**payload.model_dump(exclude={"slug"})))
            else:
                create_project(db, payload)
            changed += 1
    return changed


if __name__ == "__main__":
    print(f"Project seed records processed: {seed_projects()}")
