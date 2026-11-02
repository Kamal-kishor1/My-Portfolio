from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.slugify import slugify
from app.models.project import Project
from app.repositories import project_repository
from app.schemas.project import ProjectCreate, ProjectUpdate


def _unique_slug(db: Session, base_slug: str, exclude_id: int | None = None) -> str:
    """Appends -2, -3, ... if the slug is taken, so callers never have to think about collisions."""
    slug = base_slug
    suffix = 2
    while True:
        existing = project_repository.get_by_slug(db, slug)
        if not existing or existing.id == exclude_id:
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def list_projects(db: Session, published_only: bool) -> list[Project]:
    return project_repository.get_all(db, published_only=published_only)


def get_project_or_404(db: Session, project_id: int) -> Project:
    project = project_repository.get_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def create_project(db: Session, payload: ProjectCreate) -> Project:
    base_slug = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, base_slug)
    project = Project(**{**payload.model_dump(exclude={"slug"}), "slug": slug})
    return project_repository.create(db, project)


def update_project(db: Session, project_id: int, payload: ProjectUpdate) -> Project:
    project = get_project_or_404(db, project_id)
    updates = payload.model_dump(exclude_unset=True)

    if "slug" in updates and updates["slug"]:
        updates["slug"] = _unique_slug(db, slugify(updates["slug"]), exclude_id=project_id)
    elif "title" in updates and "slug" not in updates:
        # Title changed but slug wasn't explicitly set - leave the existing slug alone.
        # (Changing slugs silently breaks any external links/bookmarks to the project.)
        pass

    return project_repository.update(db, project, updates)


def delete_project(db: Session, project_id: int) -> None:
    project = get_project_or_404(db, project_id)
    project_repository.delete(db, project)
