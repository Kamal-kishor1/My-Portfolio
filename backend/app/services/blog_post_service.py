from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.slugify import slugify
from app.models.blog_post import BlogPost
from app.repositories import blog_post_repository
from app.schemas.blog_post import BlogPostCreate, BlogPostUpdate


def _unique_slug(db: Session, base_slug: str, exclude_id: int | None = None) -> str:
    slug = base_slug
    suffix = 2
    while True:
        existing = blog_post_repository.get_by_slug(db, slug)
        if not existing or existing.id == exclude_id:
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def list_posts(db: Session, published_only: bool) -> list[BlogPost]:
    return blog_post_repository.get_all(db, published_only=published_only)


def get_post_or_404(db: Session, post_id: int) -> BlogPost:
    post = blog_post_repository.get_by_id(db, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return post


def get_published_post_by_slug_or_404(db: Session, slug: str) -> BlogPost:
    post = blog_post_repository.get_by_slug(db, slug)
    if not post or not post.published:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return post


def create_post(db: Session, payload: BlogPostCreate) -> BlogPost:
    base_slug = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, base_slug)
    post = BlogPost(**{**payload.model_dump(exclude={"slug"}), "slug": slug})
    return blog_post_repository.create(db, post)


def update_post(db: Session, post_id: int, payload: BlogPostUpdate) -> BlogPost:
    post = get_post_or_404(db, post_id)
    updates = payload.model_dump(exclude_unset=True)
    if "slug" in updates and updates["slug"]:
        updates["slug"] = _unique_slug(db, slugify(updates["slug"]), exclude_id=post_id)
    return blog_post_repository.update(db, post, updates)


def delete_post(db: Session, post_id: int) -> None:
    post = get_post_or_404(db, post_id)
    blog_post_repository.delete(db, post)
