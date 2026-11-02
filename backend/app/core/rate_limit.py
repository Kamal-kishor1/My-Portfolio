from slowapi import Limiter
from slowapi.util import get_remote_address

# Keyed by client IP and applied to authentication and public write endpoints.
# SlowAPI's default memory storage is process-local; configure shared storage
# before running multiple API instances.
limiter = Limiter(key_func=get_remote_address)
