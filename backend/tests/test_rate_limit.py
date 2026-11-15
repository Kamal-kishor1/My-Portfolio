from starlette.requests import Request

from app.core.config import settings
from app.core.rate_limit import get_client_ip


def make_request(headers: list[tuple[bytes, bytes]], client: tuple[str, int]) -> Request:
    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/contact/",
            "headers": headers,
            "client": client,
            "server": ("testserver", 80),
            "scheme": "http",
            "query_string": b"",
        }
    )


def test_rate_limit_uses_render_client_ip_and_ignores_spoofed_x_forwarded_for(monkeypatch):
    monkeypatch.setattr(settings, "trust_cloudflare_client_ip", True)
    request = make_request(
        [
            (b"cf-connecting-ip", b"203.0.113.17"),
            (b"x-forwarded-for", b"198.51.100.99, 10.0.0.2"),
        ],
        ("10.0.0.3", 12345),
    )

    assert get_client_ip(request) == "203.0.113.17"


def test_rate_limit_falls_back_to_socket_ip_and_ignores_untrusted_forwarded_header(monkeypatch):
    monkeypatch.setattr(settings, "trust_cloudflare_client_ip", True)
    request = make_request(
        [(b"x-forwarded-for", b"198.51.100.99")],
        ("192.0.2.44", 12345),
    )

    assert get_client_ip(request) == "192.0.2.44"


def test_rate_limit_ignores_cloudflare_header_when_not_configured(monkeypatch):
    monkeypatch.setattr(settings, "trust_cloudflare_client_ip", False)
    request = make_request(
        [
            (b"cf-connecting-ip", b"203.0.113.17"),
            (b"x-forwarded-for", b"198.51.100.99"),
        ],
        ("192.0.2.44", 12345),
    )

    assert get_client_ip(request) == "192.0.2.44"
