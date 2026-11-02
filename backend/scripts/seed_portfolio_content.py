"""Idempotently seed the public portfolio content bundled with the repository."""
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.database import SessionLocal
from app.models.blog_post import BlogPost
from app.models.project import Project
from app.models.resume_entry import ResumeEntry


CONTENT_PATH = Path(__file__).with_name("portfolio_content.json")


def seed_portfolio_content() -> dict[str, int]:
    content = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    processed = {"projects": 0, "blog_posts": 0, "resume_entries": 0}

    with SessionLocal() as db:
        for record in content["projects"]:
            values = {**record, "published": True}
            item = db.query(Project).filter(Project.slug == record["slug"]).one_or_none()
            if item is None:
                item = Project(**values)
                db.add(item)
            else:
                for key, value in values.items():
                    setattr(item, key, value)
            processed["projects"] += 1

        for record in content["blog_posts"]:
            values = {**record, "published": True}
            item = db.query(BlogPost).filter(BlogPost.slug == record["slug"]).one_or_none()
            if item is None:
                item = BlogPost(**values)
                db.add(item)
            else:
                for key, value in values.items():
                    setattr(item, key, value)
            processed["blog_posts"] += 1

        for record in content["resume_entries"]:
            values = dict(record)
            for key in ("start_date", "end_date"):
                if values[key]:
                    values[key] = date.fromisoformat(values[key])
            item = (
                db.query(ResumeEntry)
                .filter(ResumeEntry.type == values["type"], ResumeEntry.title == values["title"])
                .one_or_none()
            )
            if item is None:
                item = ResumeEntry(**values)
                db.add(item)
            else:
                for key, value in values.items():
                    setattr(item, key, value)
            processed["resume_entries"] += 1

        db.commit()

    return processed


if __name__ == "__main__":
    print(f"Portfolio content records processed: {seed_portfolio_content()}")
