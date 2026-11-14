import ipaddress

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

# Keyed by client IP and applied to authentication and public write endpoints.
# SlowAPI's default memory storage is process-local; configure shared storage
# before running multiple API instances.


def get_client_ip(request: Request) -> str:
    """Use Render's edge-overwritten client-IP header when explicitly enabled."""
    if settings.trust_cloudflare_client_ip:
        forwarded_ip = request.headers.get("cf-connecting-ip", "").strip()
        try:
            return str(ipaddress.ip_address(forwarded_ip))
        except ValueError:
            pass
    return get_remote_address(request)


limiter = Limiter(key_func=get_client_ip)
