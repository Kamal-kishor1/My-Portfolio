from sqlalchemy.orm import Session

from app.models.blog_post import BlogPost


def get_all(db: Session, published_only: bool = False) -> list[BlogPost]:
    query = db.query(BlogPost)
    if published_only:
        query = query.filter(BlogPost.published.is_(True))
    return query.order_by(BlogPost.created_at.desc()).all()


def get_by_id(db: Session, post_id: int) -> BlogPost | None:
    return db.query(BlogPost).filter(BlogPost.id == post_id).first()


def get_by_slug(db: Session, slug: str) -> BlogPost | None:
    return db.query(BlogPost).filter(BlogPost.slug == slug).first()


def create(db: Session, post: BlogPost) -> BlogPost:
    db.add(post)
    db.flush()
    return post


def update(db: Session, post: BlogPost, updates: dict) -> BlogPost:
    for field, value in updates.items():
        setattr(post, field, value)
    db.flush()
    return post


def delete(db: Session, post: BlogPost) -> None:
    db.delete(post)
    db.flush()
