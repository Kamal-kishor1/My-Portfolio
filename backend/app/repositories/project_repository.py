from sqlalchemy.orm import Session

from app.models.project import Project


def get_all(db: Session, published_only: bool = False) -> list[Project]:
    query = db.query(Project)
    if published_only:
        query = query.filter(Project.published.is_(True))
    return query.order_by(Project.featured.desc(), Project.created_at.desc()).all()


def get_by_id(db: Session, project_id: int) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


def get_by_slug(db: Session, slug: str) -> Project | None:
    return db.query(Project).filter(Project.slug == slug).first()


def create(db: Session, project: Project) -> Project:
    db.add(project)
    db.flush()
    return project


def update(db: Session, project: Project, updates: dict) -> Project:
    for field, value in updates.items():
        setattr(project, field, value)
    db.flush()
    return project


def delete(db: Session, project: Project) -> None:
    db.delete(project)
    db.flush()
