# --- builder: install deps into a venv, keeps final image free of build tools ---
FROM python:3.12-slim AS builder

WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Test-only target; the production image below never includes pytest.
FROM builder AS test
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
COPY app ./app
COPY tests ./tests
COPY scripts ./scripts
CMD ["python", "-m", "pytest"]

# --- final: slim runtime image, no compilers/build headers ---
FROM python:3.12-slim

# Runtime-only system deps: libpq for psycopg2 to talk to Postgres
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Non-root user - containers shouldn't run as root
RUN useradd --create-home --shell /bin/bash appuser
WORKDIR /app

COPY --from=builder --chown=appuser:appuser /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .
COPY scripts ./scripts
COPY healthcheck.py .

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8002
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["python", "healthcheck.py"]

# No --reload in production images - reload is a dev-only convenience that
# also burns extra CPU watching the filesystem.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port \"${PORT:-8002}\" --proxy-headers --forwarded-allow-ips '*'"]
