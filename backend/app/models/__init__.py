from app.core.database import Base  # noqa: F401

# Import every model so it registers on Base.metadata.
# Alembic's autogenerate diffs against Base.metadata, so anything
# not imported here is invisible to migrations.
from app.models.user import User  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.media import Media  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.blog_post import BlogPost  # noqa: F401
from app.models.resume_entry import ResumeEntry  # noqa: F401
from app.models.contact_message import ContactMessage  # noqa: F401
from app.models.seo_meta import SeoMeta  # noqa: F401
from app.models.analytics_event import AnalyticsEvent  # noqa: F401
from app.models.admin_audit_log import AdminAuditLog  # noqa: F401
