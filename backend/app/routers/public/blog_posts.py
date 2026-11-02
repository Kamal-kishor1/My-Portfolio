from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.blog_post import BlogPostOut, BlogPostListItem
from app.services import blog_post_service

router = APIRouter(prefix="/api/blog-posts", tags=["public:blog"])


@router.get("/", response_model=list[BlogPostListItem])
def list_published_posts(db: Session = Depends(get_db)):
    return blog_post_service.list_posts(db, published_only=True)


@router.get("/{slug}", response_model=BlogPostOut)
def get_published_post(slug: str, db: Session = Depends(get_db)):
    return blog_post_service.get_published_post_by_slug_or_404(db, slug)
