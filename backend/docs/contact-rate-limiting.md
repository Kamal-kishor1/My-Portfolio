# Contact rate limit and Render client IP

The contact route is limited to `CONTACT_RATE_LIMIT` per client IP (default: `5/hour`). In Render, the API is behind Render's Cloudflare edge and load balancer. The backend opts into `CF-Connecting-IP` with `TRUST_CLOUDFLARE_CLIENT_IP=true`; Render's edge overwrites that header for inbound requests. The application validates that it contains one IP address before using it as the SlowAPI key.

The API deliberately does not derive the limiter key from `X-Forwarded-For`. Render can append to that header, so a caller supplied leftmost value is not safe to trust. The Docker image also starts Uvicorn without proxy-header trust, preventing an untrusted forwarded header from changing `request.client`.

`backend/tests/test_rate_limit.py` verifies that a trusted Render client-IP header determines the key and that a spoofed `X-Forwarded-For` value is ignored. It also verifies the socket-IP fallback when the trusted header is absent or disabled. Keep `TRUST_CLOUDFLARE_CLIENT_IP` enabled only when the service is reached through Render's edge; leave it false for direct/local deployments.
