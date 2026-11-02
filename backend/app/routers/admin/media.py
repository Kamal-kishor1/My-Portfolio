import logging
import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.media import Media
from app.models.project import Project
from app.models.blog_post import BlogPost
from app.models.seo_meta import SeoMeta
from app.dependencies.auth import require_role
from app.schemas.media import MediaCreate, MediaOut
from app.services.object_storage import delete_object, presigned_download_url, upload_object
from app.services.admin_audit import record_admin_action

router = APIRouter(prefix="/admin/media", tags=["admin:media"])
_require_editor = require_role("admin", "editor")
logger = logging.getLogger("portfolio.media")

_ALLOWED_FILE_TYPES = {
    "image/jpeg": (".jpg", lambda data: data.startswith(b"\xff\xd8\xff")),
    "image/png": (".png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/gif": (".gif", lambda data: data.startswith((b"GIF87a", b"GIF89a"))),
    "image/webp": (
        ".webp",
        lambda data: len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    ),
    "application/pdf": (".pdf", lambda data: data.startswith(b"%PDF-")),
}


def _to_output(media: Media) -> MediaOut:
    url = (
        presigned_download_url(media.storage_key)
        if media.storage_key
        else media.url
    )
    return MediaOut(
        id=media.id,
        filename=media.filename,
        url=url,
        alt_text=media.alt_text,
        uploaded_by=media.uploaded_by,
        created_at=media.created_at,
        content_type=media.content_type,
    )


@router.get("/", response_model=list[MediaOut])
def list_media(db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    media_items = db.query(Media).order_by(Media.created_at.desc()).all()
    return [_to_output(item) for item in media_items]


@router.post("/", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
def create_media(
    payload: MediaCreate, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)
):
    media = Media(**payload.model_dump(), uploaded_by=current_user.id)
    db.add(media)
    db.flush()
    record_admin_action(db, current_user, "register", "media", media.id)
    db.commit()
    db.refresh(media)
    return _to_output(media)


@router.post("/upload", response_model=MediaOut, status_code=status.HTTP_201_CREATED)
def upload_media(
    file: UploadFile = File(...),
    alt_text: str | None = Form(default=None, max_length=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(_require_editor),
):
    if not settings.storage_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neon Object Storage is not configured",
        )

    filename = os.path.basename((file.filename or "upload").replace("\\", "/"))[:255]
    content_type = (file.content_type or "").split(";", maxsplit=1)[0].strip().lower()
    file_type = _ALLOWED_FILE_TYPES.get(content_type)
    if not file_type:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    body = file.file.read(settings.max_upload_size_bytes + 1)
    if len(body) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB upload limit")
    extension, signature_check = file_type
    if not signature_check(body):
        raise HTTPException(status_code=415, detail="File content does not match its declared type")

    storage_key = f"portfolio/{uuid.uuid4().hex}{extension}"
    try:
        upload_object(storage_key, body, content_type)
    except Exception:
        logger.error("Neon Object Storage upload failed")
        raise HTTPException(status_code=502, detail="Media storage upload failed") from None

    media = Media(
        filename=filename,
        url=f"neon-storage://{settings.neon_storage_bucket}/{storage_key}",
        storage_key=storage_key,
        content_type=content_type,
        alt_text=alt_text,
        uploaded_by=current_user.id,
    )
    try:
        db.add(media)
        db.flush()
        record_admin_action(db, current_user, "upload", "media", media.id)
        db.commit()
        db.refresh(media)
    except Exception:
        db.rollback()
        try:
            delete_object(storage_key)
        except Exception:
            logger.error("Failed to clean up an object after media metadata persistence failed")
        raise HTTPException(status_code=500, detail="Media metadata could not be saved") from None
    return _to_output(media)


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(media_id: int, db: Session = Depends(get_db), current_user: User = Depends(_require_editor)):
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    project_uses_media = db.query(Project.id).filter(Project.cover_image_id == media_id).first()
    post_uses_media = db.query(BlogPost.id).filter(BlogPost.cover_image_id == media_id).first()
    site_uses_media = (
        db.query(SeoMeta.id)
        .filter(SeoMeta.entity_type == "site", SeoMeta.entity_id.is_(None), SeoMeta.og_image_id == media_id)
        .first()
    )
    if project_uses_media or post_uses_media or site_uses_media:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Media is in use; replace its project, post, or homepage image before deleting it",
        )
    storage_key = media.storage_key
    record_admin_action(db, current_user, "delete", "media", media.id)
    db.delete(media)
    db.commit()
    if storage_key:
        try:
            delete_object(storage_key)
        except Exception:
            # Keep the API result consistent with the committed database delete;
            # a future object-cleanup task can remove this orphaned key.
            logger.warning("Neon Object Storage object cleanup failed after media deletion")
