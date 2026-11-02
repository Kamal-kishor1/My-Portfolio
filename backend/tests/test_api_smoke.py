"""Critical API flows against an isolated PostgreSQL test database."""
import pytest
from concurrent.futures import ThreadPoolExecutor
from threading import Barrier
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, engine
from app.core.rate_limit import limiter
from app.core.security import hash_password
from app.main import app
from app.models.user import User
from app.models.media import Media
from app.models.project import Project
from app.services.auth_service import issue_token_pair, rotate_refresh_token
from app.core.config import SecretStr


@pytest.fixture
def client():
    database_url = settings.database_url
    if "test" not in database_url.lower():
        pytest.fail("API smoke tests require an isolated DATABASE_URL containing 'test'")

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    limiter._storage.reset()

    with TestClient(app) as test_client:
        yield test_client

    limiter._storage.reset()
    Base.metadata.drop_all(bind=engine)


def create_admin() -> tuple[str, str]:
    email = "smoke-admin@example.com"
    password = "Local-Smoke-Password-123!"
    test_session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with test_session_factory() as db:
        db.add(
            User(
                email=email,
                password_hash=hash_password(password),
                role="admin",
                is_active=True,
            )
        )
        db.commit()
    return email, password


def login(client: TestClient) -> str:
    email, password = create_admin()
    response = client.post(
        "/api/admin/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_health_and_public_reads(client: TestClient):
    live = client.get("/live")
    assert live.status_code == 200
    assert live.headers["x-content-type-options"] == "nosniff"
    assert live.headers["x-frame-options"] == "DENY"
    assert live.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert client.get("/ready").status_code == 200
    assert client.get("/api/projects/").status_code == 200
    assert client.get("/api/blog-posts/").status_code == 200
    assert client.get("/api/resume/").status_code == 200


def test_public_write_payload_limits(client: TestClient):
    too_long_contact = client.post(
        "/api/contact/",
        json={
            "name": "Visitor",
            "email": "visitor@example.com",
            "message": "x" * 5001,
        },
    )
    assert too_long_contact.status_code == 422

    too_long_path = client.post(
        "/api/analytics/event",
        json={"path": "/" + "x" * 512},
    )
    assert too_long_path.status_code == 422


def test_admin_login_refresh_and_project_crud(client: TestClient):
    email, password = create_admin()
    login_response = client.post(
        "/api/admin/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    assert client.get("/api/admin/auth/me", headers=headers).json()["email"] == email

    refresh_response = client.post("/api/admin/auth/refresh")
    assert refresh_response.status_code == 200
    headers["Authorization"] = f"Bearer {refresh_response.json()['access_token']}"

    created = client.post(
        "/api/admin/projects/",
        headers=headers,
        json={
            "title": "API Smoke Project",
            "slug": "api-smoke-project",
            "summary": "Temporary integration test project",
            "tech_stack": ["FastAPI", "PostgreSQL"],
            "published": True,
        },
    )
    assert created.status_code == 201
    project_id = created.json()["id"]
    updated = client.patch(
        f"/api/admin/projects/{project_id}",
        headers=headers,
        json={"summary": "Updated integration test project"},
    )
    assert updated.status_code == 200
    assert updated.json()["summary"] == "Updated integration test project"
    assert client.get("/api/projects/").status_code == 200
    assert client.delete(f"/api/admin/projects/{project_id}", headers=headers).status_code == 204
    audit = client.get("/api/admin/audit-logs/", headers=headers)
    assert audit.status_code == 200
    project_events = [
        item for item in audit.json()
        if item["entity_type"] == "project" and item["entity_id"] == str(project_id)
    ]
    assert {item["action"] for item in project_events} == {"create", "update", "delete"}
    assert all(item["actor_email"] == email for item in project_events)
    assert len(client.get("/api/admin/audit-logs/?limit=1", headers=headers).json()) <= 1
    assert client.get("/api/admin/audit-logs/").status_code == 401

    editor_email = "audit-editor@example.com"
    with sessionmaker(bind=engine, autoflush=False, autocommit=False)() as db:
        db.add(
            User(
                email=editor_email,
                password_hash=hash_password("Editor-Smoke-Password-123!"),
                role="editor",
                is_active=True,
            )
        )
        db.commit()
    editor_login = client.post(
        "/api/admin/auth/login",
        json={"email": editor_email, "password": "Editor-Smoke-Password-123!"},
    )
    assert editor_login.status_code == 200
    editor_headers = {"Authorization": f"Bearer {editor_login.json()['access_token']}"}
    assert client.get("/api/admin/audit-logs/", headers=editor_headers).status_code == 403
    assert client.post("/api/admin/auth/logout").status_code == 200


def test_production_auth_cookie_and_origin_protection(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "environment", "production")
    email, password = create_admin()
    allowed_origin = settings.cors_origin_list[0]

    login_response = client.post(
        "/api/admin/auth/login",
        headers={"Origin": allowed_origin},
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    refresh_cookie = login_response.headers["set-cookie"].lower()
    assert "httponly" in refresh_cookie
    assert "secure" in refresh_cookie
    assert "samesite=none" in refresh_cookie

    assert client.post(
        "/api/admin/auth/login",
        headers={"Origin": "https://attacker.example"},
        json={"email": email, "password": password},
    ).status_code == 403
    assert client.post("/api/admin/auth/refresh").status_code == 403
    assert client.post(
        "/api/admin/auth/refresh",
        headers={"Origin": "https://attacker.example"},
    ).status_code == 403
    assert client.post(
        "/api/admin/auth/logout",
        headers={"Origin": "https://attacker.example"},
    ).status_code == 403


def test_refresh_token_can_only_be_rotated_once_concurrently(client: TestClient):
    email, _ = create_admin()
    with sessionmaker(bind=engine, autoflush=False, autocommit=False)() as db:
        user = db.query(User).filter(User.email == email).one()
        _, raw_refresh_token = issue_token_pair(db, user)

    barrier = Barrier(2)

    def rotate():
        with sessionmaker(bind=engine, autoflush=False, autocommit=False)() as db:
            barrier.wait(timeout=5)
            try:
                rotate_refresh_token(db, raw_refresh_token)
                return "rotated"
            except HTTPException as error:
                return error.status_code

    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(lambda _: rotate(), range(2)))

    assert results.count("rotated") == 1
    assert results.count(401) == 1


def test_admin_blog_resume_and_seo_crud_are_audited(client: TestClient):
    headers = {"Authorization": f"Bearer {login(client)}"}

    blog = client.post(
        "/api/admin/blog-posts/",
        headers=headers,
        json={"title": "Audit Trail Test", "content": "Draft body"},
    )
    assert blog.status_code == 201
    blog_id = blog.json()["id"]
    assert client.patch(
        f"/api/admin/blog-posts/{blog_id}", headers=headers, json={"published": True}
    ).status_code == 200
    assert client.delete(f"/api/admin/blog-posts/{blog_id}", headers=headers).status_code == 204

    resume = client.post(
        "/api/admin/resume-entries/",
        headers=headers,
        json={"type": "experience", "title": "Audit Test Role"},
    )
    assert resume.status_code == 201
    resume_id = resume.json()["id"]
    assert client.patch(
        f"/api/admin/resume-entries/{resume_id}", headers=headers, json={"title": "Updated Role"}
    ).status_code == 200
    assert client.delete(f"/api/admin/resume-entries/{resume_id}", headers=headers).status_code == 204

    seo = client.post(
        "/api/admin/seo/",
        headers=headers,
        json={"entity_type": "site", "title": "Audit Test Site"},
    )
    assert seo.status_code == 201
    seo_id = seo.json()["id"]
    assert client.patch(
        f"/api/admin/seo/{seo_id}", headers=headers, json={"title": "Updated Site Title"}
    ).status_code == 200
    assert client.delete(f"/api/admin/seo/{seo_id}", headers=headers).status_code == 204

    events = client.get("/api/admin/audit-logs/?limit=100", headers=headers).json()
    assert {event["entity_type"] for event in events} >= {"blog_post", "resume_entry", "seo_meta"}


def test_contact_submission_and_admin_message_review(client: TestClient):
    message = client.post(
        "/api/contact/",
        json={
            "name": "API Smoke Test",
            "email": "smoke-contact@example.com",
            "message": "Temporary integration test message",
        },
    )
    assert message.status_code == 200
    message_id = message.json()["id"]

    headers = {"Authorization": f"Bearer {login(client)}"}
    messages = client.get("/api/admin/contact-messages/", headers=headers)
    assert messages.status_code == 200
    assert any(item["id"] == message_id for item in messages.json())

    reviewed = client.patch(f"/api/admin/contact-messages/{message_id}/read", headers=headers)
    assert reviewed.status_code == 200
    assert reviewed.json()["is_read"] is True
    assert client.delete(f"/api/admin/contact-messages/{message_id}", headers=headers).status_code == 204


def test_contact_write_rate_limit(client: TestClient):
    statuses = [
        client.post(
            "/api/contact/",
            json={
                "name": "Rate Limit Test",
                "email": "rate-limit@example.com",
                "message": f"Message {index}",
            },
        ).status_code
        for index in range(6)
    ]
    assert 429 in statuses


def test_media_upload_validation_and_storage(client: TestClient, monkeypatch):
    from app.routers.admin import media as media_router

    monkeypatch.setattr(settings, "aws_access_key_id", SecretStr("test-access"))
    monkeypatch.setattr(settings, "aws_secret_access_key", SecretStr("test-secret"))
    monkeypatch.setattr(settings, "aws_endpoint_url_s3", "https://storage.example.test")
    monkeypatch.setattr(settings, "aws_region", "aws-us-east-1")
    uploaded = {}
    monkeypatch.setattr(
        media_router,
        "upload_object",
        lambda key, body, content_type: uploaded.update(
            key=key, body=body, content_type=content_type
        ),
    )
    monkeypatch.setattr(media_router, "presigned_download_url", lambda key: f"https://signed.test/{key}")
    token = login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/admin/media/upload",
        headers=headers,
        files={"file": ("avatar.png", b"\x89PNG\r\n\x1a\nimage", "image/png")},
        data={"alt_text": "Profile image"},
    )
    assert response.status_code == 201
    assert response.json()["filename"] == "avatar.png"
    assert response.json()["url"].startswith("https://signed.test/portfolio/")
    assert response.json()["content_type"] == "image/png"
    assert uploaded["body"] == b"\x89PNG\r\n\x1a\nimage"

    rejected = client.post(
        "/api/admin/media/upload",
        headers=headers,
        files={"file": ("fake.png", b"not an image", "image/png")},
    )
    assert rejected.status_code == 415

    monkeypatch.setattr(settings, "max_upload_size_bytes", 8)
    oversized = client.post(
        "/api/admin/media/upload",
        headers=headers,
        files={"file": ("large.png", b"\x89PNG\r\n\x1a\nX", "image/png")},
    )
    assert oversized.status_code == 413

    monkeypatch.setattr(
        media_router,
        "upload_object",
        lambda key, body, content_type: (_ for _ in ()).throw(RuntimeError("storage unavailable")),
    )
    storage_failure = client.post(
        "/api/admin/media/upload",
        headers=headers,
        files={"file": ("valid.png", b"\x89PNG\r\n\x1a\n", "image/png")},
    )
    assert storage_failure.status_code == 502


def test_media_in_use_cannot_be_deleted(client: TestClient):
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with session_factory() as db:
        media = Media(filename="cover.png", url="https://example.com/cover.png")
        db.add(media)
        db.flush()
        db.add(
            Project(
                title="Media Reference Test",
                slug="media-reference-test",
                tech_stack=[],
                published=False,
                cover_image_id=media.id,
            )
        )
        db.commit()
        media_id = media.id

    response = client.delete(
        f"/api/admin/media/{media_id}",
        headers={"Authorization": f"Bearer {login(client)}"},
    )
    assert response.status_code == 409
    assert response.json()["detail"].startswith("Media is used")
