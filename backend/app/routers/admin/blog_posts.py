from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.dependencies.auth import require_role
from app.schemas.blog_post import BlogPostCreate, BlogPostUpdate, BlogPostOut, BlogPostListItem
from app.services import blog_post_service
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/blog-posts", tags=["admin:blog"])
_require_editor = require_role("admin", "editor")


@router.get("/", response_model=list[BlogPostListItem])
def list_all_posts(db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    return blog_post_service.list_posts(db, published_only=False)


@router.get("/{post_id}", response_model=BlogPostOut)
def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    return blog_post_service.get_post_or_404(db, post_id)


@router.post("/", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    post = blog_post_service.create_post(db, payload)
    record_admin_action(db, current_user, "create", "blog_post", post.id)
    db.commit()
    db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=BlogPostOut)
def update_post(
    post_id: int, payload: BlogPostUpdate, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)
):
    post = blog_post_service.update_post(db, post_id, payload)
    record_admin_action(db, current_user, "update", "blog_post", post.id)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    blog_post_service.delete_post(db, post_id)
    record_admin_action(db, current_user, "delete", "blog_post", post_id)
    db.commit()
