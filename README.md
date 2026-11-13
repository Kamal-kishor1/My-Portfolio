# 🚀 Kamal Kishor — Full-Stack Software Engineer Portfolio

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E5A0?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMiIgZmlsbD0iIzAwRTVBMCIvPjwvc3ZnPg==&logoColor=white)](https://neon.tech/)
[![Alembic](https://img.shields.io/badge/Alembic-1.14-6C757D?style=for-the-badge)](https://alembic.sqlalchemy.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

> A production-grade, full-stack software engineering portfolio — not a static template, but a **dynamically-driven, API-backed platform** with a secure admin CMS, JWT authentication with refresh-token rotation, Neon Object Storage, rate-limited public endpoints, structured JSON logging, automated CI/CD pipelines, and comprehensive security automation. Engineered to the same standards as production SaaS infrastructure.

**🌐 Live Deployment:**  [`Frontend`](https://my-portfolio-john-ea11.vercel.app) ` | ` [`Backend API`](https://portfolio-backend-r80f.onrender.com/health) ` | ` [`API Docs`](https://portfolio-backend-r80f.onrender.com/docs)

---

## 🌟 Key Features

### 🎨 1. Modern React 19 Frontend (SPA)
* **React 19 + TypeScript 5 + Vite 8:** Strict-mode TypeScript, lazy-loaded routes with `React.Suspense`, and sub-second HMR via Vite's native ESM dev server.
* **Tailwind CSS v4** with `@tailwindcss/typography` for rich Markdown prose styling and CSS custom properties for seamless dark/light theming.
* **Client-Side Routing:** `react-router-dom` v7 with `vercel.json` SPA rewrite rules (`/(.*) → /index.html`) ensuring deep-link support and clean URLs.
* **Markdown Blog Rendering:** `react-markdown` + `remark-gfm` renders GitHub-Flavored Markdown blog content fetched from the API.
* **SEO & Open Graph:** `react-helmet-async` injects per-page `<title>`, `<meta description>`, and Open Graph/Twitter Card tags dynamically.
* **Axios HTTP Client** with request/response interceptors for automatic JWT injection, transparent 401 → refresh-token rotation, and session expiry handling.

### ⚙️ 2. FastAPI Backend & Admin CMS
* **RESTful API** with clean separation between **public** (unauthenticated) and **admin** (JWT-protected) route namespaces, mounted under `/api`.
* **Full CRUD Admin Dashboard:** Manage Projects, Blog Posts, Resume Entries, Contact Messages, Media, and SEO Metadata — all through a React admin panel backed by FastAPI endpoints.
* **Pydantic v2 Schemas** with strict validation, email validation (`email-validator`), field length limits, and automatic slug generation with collision resolution.
* **Repository → Service → Router** layered architecture for clean separation of concerns and testability.

### 🔐 3. Production-Grade Authentication & Security
* **JWT Access + Refresh Token Rotation:** Short-lived access tokens (15 min) paired with long-lived refresh tokens (30 days) stored as SHA-256 hashes in the database — raw tokens never persisted.
* **Argon2id Password Hashing:** Memory-hard KDF resistant to GPU cracking attacks, with `bcrypt` as a migration-safe fallback verifier.
* **httpOnly Secure Cookies:** Refresh tokens transported via `httpOnly`, `Secure`, `SameSite=None` cookies — immune to XSS token theft.
* **Origin Validation:** Every auth mutation (`login`, `refresh`, `logout`) validates the `Origin` header against the `ALLOWED_ORIGINS` allowlist in production.
* **Security Response Headers:** Every response includes `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Strict-Transport-Security` (HSTS) in production.
* **Rate Limiting (SlowAPI):** IP-based rate limiting on login (`5/minute`), contact form (`5/hour`), and analytics (`60/minute`) endpoints to prevent brute-force and abuse.
* **Role-Based Access Control (RBAC):** `admin` and `editor` roles with `require_role()` dependency injection — audit logs are admin-only.
* **Production Config Validation:** Pydantic model validators enforce ≥32-char secrets, distinct `JWT_SECRET_KEY` / `SECRET_KEY`, HTTPS-only CORS origins, and configured object storage in production environments.

### 📦 4. Neon Object Storage (S3-Compatible Media Pipeline)
* **Direct File Upload:** Admin media endpoint validates file type via **magic byte signature verification** (not just MIME headers), enforces a 10 MB size limit, and uploads to Neon's S3-compatible object storage via `boto3`.
* **Presigned Download URLs:** Private media objects are served through time-limited presigned URLs (1-hour expiry) — never exposing raw storage credentials to the browser.
* **Referential Integrity Protection:** Media deletion is blocked if the asset is referenced by any project cover image, blog post, or homepage photo — with automatic orphan cleanup on upload failures.

### 📊 5. Admin Audit Trail
* **Immutable Audit Logging:** Every admin mutation (create, update, delete, upload, mark_read) records `actor_user_id`, `action`, `entity_type`, `entity_id`, and `created_at` to the `admin_audit_logs` table — providing a tamper-evident change history for compliance and debugging.
* **Paginated Audit API:** Admin-only endpoint with `limit`/`offset` pagination and joined `actor_email` resolution.

---

## 🏗️ System Architecture & Production Infrastructure

```mermaid
flowchart TD
    subgraph Client ["Client Browser"]
        SPA["React 19 SPA<br/>Vite + Tailwind CSS v4"]
    end

    subgraph Vercel ["Vercel Edge CDN"]
        CDN["Static Asset Hosting<br/>SPA Rewrite Rules"]
        Preview["PR Preview Environments"]
    end

    subgraph Render ["Render (Docker)"]
        API["FastAPI Backend<br/>Uvicorn + Proxy Headers"]
        Alembic["Alembic Migrations<br/>Auto-run on Deploy"]
    end

    subgraph NeonCloud ["Neon Cloud"]
        PG["PostgreSQL 16<br/>Serverless + SSL + Pooling"]
        S3["Object Storage<br/>S3-Compatible API"]
    end

    subgraph GHActions ["GitHub Actions CI/CD"]
        FCI["Frontend CI<br/>Lint → Type-Check → Build"]
        BCI["Backend CI<br/>Postgres 16 Service → Pytest"]
        DI["Docker Image Verification<br/>Buildx Multi-stage"]
        DP["Deploy Preview<br/>Vercel PR Environments"]
        DB["Deploy Backend<br/>Render Hook"]
        DF["Deploy Frontend<br/>Vercel Production"]
    end

    SPA -->|HTTPS| CDN
    CDN -->|API Proxy| API
    API -->|SSL Pooled| PG
    API -->|Presigned URLs| S3
    Alembic -->|Unpooled| PG

    FCI --> DP
    BCI --> DP
    DI --> DP
    FCI --> DB
    BCI --> DB
    DI --> DB
    DB --> DF
```

### Why This Architecture?

| Component | What It Does | Why This Choice |
| :--- | :--- | :--- |
| **Vercel (Frontend)** | Edge CDN hosting for the Vite/React SPA with SPA rewrite rules and isolated PR preview environments. | Separating static/edge delivery from the API server provides **global sub-50ms latency** for asset delivery, **zero-downtime rollbacks** via immutable deployments, and **free PR preview URLs** for visual QA before merging. |
| **Render + Docker (Backend)** | Containerized FastAPI service deployed via multi-stage `Dockerfile` and `render.yaml`, running `alembic upgrade head` at container startup. | Dockerizing the backend **guarantees environment parity** between local development, CI test runners, and production — the same Python 3.12 slim image, the same `libpq5`, the same non-root `appuser`. Render's `healthCheckPath: /ready` and `preDeployCommand: alembic upgrade head` ensure migrations complete before traffic routes. |
| **Neon PostgreSQL (Serverless)** | Cloud-hosted Postgres 16 with SSL-enforced pooled connections and separate unpooled URLs for migrations. | Serverless Postgres with **connection pooling prevents connection exhaustion** under burst traffic, **scales to zero** during idle periods, and **separates compute from storage** — eliminating the cost and ops burden of a persistent database server. |
| **Neon Object Storage** | S3-compatible blob storage for media uploads with presigned URL delivery. | Co-located with the database on Neon's infrastructure, providing **branch-aware storage** that mirrors database branches, **no additional provider** to configure, and S3v4 signed URLs for secure, time-limited media access. |

---

## 🔄 CI/CD Pipeline & Automated Deployments

The 5-stage GitHub Actions pipeline (`.github/workflows/ci.yml`) enforces quality gates on every commit:

```mermaid
flowchart LR
    subgraph Parallel ["Parallel CI Gates"]
        FE["1. Frontend CI<br/>npm ci → lint → type-check → build"]
        BE["2. Backend CI<br/>Postgres 16 → compileall → alembic → pytest"]
        DK["3. Docker Verification<br/>Buildx: backend + frontend images"]
    end

    Parallel -->|PR| PRV["4. Deploy Preview<br/>Vercel Preview URL"]
    Parallel -->|main push| PROD_BE["5a. Deploy Backend<br/>Render Deploy Hook"]
    PROD_BE --> PROD_FE["5b. Deploy Frontend<br/>Vercel Production"]
```

| Stage | Gate | Why It Exists |
| :--- | :--- | :--- |
| **1. Frontend CI** | `npm ci` → `eslint` → `tsc --noEmit` → `vite build` | Catches **type mismatches**, broken imports, lint violations, and bundling errors before code ever merges. Strict TypeScript (`"strict": true`) ensures no implicit `any` leaks into production. |
| **2. Backend CI** | Ephemeral **PostgreSQL 16 service container** with health checks → `python -m compileall` → `alembic upgrade head` → `pytest` → FastAPI app initialization verification | Validates database migrations and API routes against a **real Postgres engine** rather than brittle mocks. The `compileall` step catches syntax errors across all Python source files. The app initialization check (`from app.main import app`) ensures all routers mount without import errors. |
| **3. Docker Verification** | `docker/build-push-action` builds both `./backend` and `./frontend` images via Docker Buildx | Ensures **Dockerfile instructions and production build arguments stay valid** on every commit — catches broken `COPY` paths, missing system deps, and bad build args before they reach deployment. |
| **4. PR Preview** | Deploys an isolated **Vercel preview URL** on Pull Requests, reports status to GitHub's Deployments environment (`Preview`) | Enables **visual and functional QA** on live URLs before merging into `main`. Reviewers can test the exact build that will ship to production. |
| **5. Sequential Production** | Triggers Render deploy hook first (`deploy-backend`), then Vercel production deploy (`deploy-frontend`). Only runs on merges to `main` after all CI gates pass. | **Prevents frontend/backend API version skew** during releases — database migrations and API updates go live before the frontend deploys, ensuring the SPA never calls endpoints that don't exist yet. |

---

## 🛡️ Security, Governance & Dependency Automation

### Dependabot Automated Dependency Updates

Configured in `.github/dependabot.yml` to monitor **three package ecosystems** on a weekly schedule (every Monday):

| Ecosystem | Directory | Purpose |
| :--- | :--- | :--- |
| `npm` | `/` (root) | Root-level tooling and shared dev dependencies |
| `npm` | `/frontend` | React, Vite, Tailwind CSS, and all frontend packages |
| `pip` | `/backend` | FastAPI, SQLAlchemy, Alembic, PyJWT, boto3, and all Python packages |

Each ecosystem is configured with `open-pull-requests-limit: 10` and auto-labeled `dependencies` + `automated` for easy triage.

**Why:** Mitigates **supply-chain vulnerabilities** by automatically surfacing outdated or vulnerable dependencies as pull requests — reducing the window of exposure from "whenever someone remembers to check" to "within 7 days of a patch release."

### Repository Security Controls

| Control | Implementation | Why |
| :--- | :--- | :--- |
| **`SECURITY.md` Vulnerability Disclosure** | Documented policy directing reporters to GitHub's private vulnerability reporting — no sensitive details in public issues. | Provides a **clear, responsible disclosure channel** so security researchers know how to report vulnerabilities without broadcasting them. |
| **`.env.example` Template Hygiene** | Two `.env.example` files (root + backend) with every variable documented but no real credentials. `.gitignore` excludes `.env`, `.env.local`, `.env.production`. | Prevents **accidental secret leaks** to version control while giving developers a complete variable reference for local setup. |
| **Encrypted GitHub Actions Secrets** | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK`, and `DATABASE_URL` stored as encrypted repository secrets — never hardcoded in workflows. | Secrets are **injected at runtime** and masked in logs, preventing credential exposure in CI output or workflow file history. |
| **Production Config Validator** | Pydantic `model_validator` rejects weak/default secrets, HTTP origins, missing `DATABASE_URL_UNPOOLED`, and unconfigured object storage when `ENVIRONMENT=production`. | Acts as a **startup-time guardrail** — the application refuses to boot with insecure configuration, making misconfigured deployments impossible. |
| **Secret Scanning & Push Protection** | Enabled via GitHub repository settings (referenced in `SECURITY.md`). | Blocks commits containing detected secrets (API keys, tokens, passwords) **before they enter the repository history.** |
| **GitHub Actions `permissions`** | CI workflow declares `contents: read`, `deployments: write` — minimal permissions following the principle of least privilege. | Limits the **blast radius** of a compromised workflow token to only reading source code and updating deployment statuses. |

> **Recommended Enhancement:** Adding a [GitHub CodeQL](https://codeql.github.com/) workflow for automated SAST (Static Application Security Testing) across Python, JavaScript/TypeScript, and GitHub Actions would detect injection flaws, insecure dependencies, and workflow vulnerabilities at the pull request level.

---

## 💾 Database Schema (PostgreSQL 16 / Neon)

10 tables managed by 4 Alembic migration revisions:

| Table | Key Columns | Description |
| :--- | :--- | :--- |
| `users` | `id`, `email` (unique, indexed), `password_hash` (Argon2), `role`, `is_active` | Admin/editor accounts with RBAC roles. |
| `refresh_tokens` | `id`, `user_id` (FK → users, CASCADE), `token_hash` (SHA-256), `expires_at`, `revoked` | Hashed refresh tokens for secure session rotation. Raw tokens never stored. |
| `projects` | `id`, `title`, `slug` (unique, indexed), `summary`, `description`, `tech_stack` (ARRAY), `repo_url`, `live_url`, `cover_image_id` (FK → media), `published`, `featured` | Portfolio project entries with draft/published workflow and optional cover images. |
| `blog_posts` | `id`, `title`, `slug` (unique, indexed), `content` (Markdown), `cover_image_id` (FK → media), `published` | Blog articles with Markdown content and draft/published states. |
| `resume_entries` | `id`, `type` (`experience` / `education` / `skill`), `title`, `organization`, `description`, `start_date`, `end_date`, `sort_order` | Ordered resume items supporting multiple entry types. |
| `contact_messages` | `id`, `name`, `email`, `message`, `is_read` | Visitor contact form submissions with read/unread tracking. |
| `media` | `id`, `filename`, `url`, `storage_key` (unique, indexed), `content_type`, `alt_text`, `uploaded_by` (FK → users) | Media asset registry supporting both external URLs and Neon Object Storage keys. |
| `seo_meta` | `id`, `entity_type` (`project` / `blog_post` / `site`), `entity_id`, `title`, `description`, `og_image_id` (FK → media) | Per-entity and site-wide SEO metadata and Open Graph images. |
| `analytics_events` | `id`, `path`, `referrer`, `user_agent` | Lightweight page-view analytics (legacy table retained for migration data). |
| `admin_audit_logs` | `id`, `actor_user_id` (FK → users), `action`, `entity_type`, `entity_id` | Immutable admin action audit trail with indexed timestamps and actor lookups. |

---

## 🌐 API Endpoints

### Public Endpoints (Unauthenticated)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/` | List all published projects |
| `GET` | `/api/blog-posts/` | List all published blog posts |
| `GET` | `/api/blog-posts/{slug}` | Get a published blog post by slug |
| `GET` | `/api/resume/` | Get all resume entries (ordered by `sort_order`) |
| `POST` | `/api/contact/` | Submit a contact message (rate-limited: 5/hour) |
| `POST` | `/api/analytics/event` | Log a page-view event (rate-limited: 60/minute) |
| `GET` | `/api/site/homepage-photo` | Get the site-wide homepage profile photo |
| `GET` | `/health` | Health check (database connectivity) |
| `GET` | `/live` | Liveness probe (process alive) |
| `GET` | `/ready` | Readiness probe (database reachable) |

### Admin Endpoints (JWT-Protected, `/api/admin/...`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/auth/login` | Authenticate and receive access + refresh tokens (rate-limited: 5/min) |
| `POST` | `/api/admin/auth/refresh` | Rotate refresh token and get new access token |
| `POST` | `/api/admin/auth/logout` | Revoke refresh token and clear cookie |
| `GET` | `/api/admin/auth/me` | Get current authenticated user profile |
| `GET/POST/PATCH/DELETE` | `/api/admin/projects/` | Full CRUD for projects (editor+) |
| `GET/POST/PATCH/DELETE` | `/api/admin/blog-posts/` | Full CRUD for blog posts (editor+) |
| `GET/POST/PATCH/DELETE` | `/api/admin/resume-entries/` | Full CRUD for resume entries (editor+) |
| `GET/PATCH/DELETE` | `/api/admin/contact-messages/` | List, mark read, delete messages (editor+) |
| `GET/POST/DELETE` | `/api/admin/media/` | List, register, delete media (editor+) |
| `POST` | `/api/admin/media/upload` | Upload file to Neon Object Storage (editor+) |
| `GET/POST/PATCH/DELETE` | `/api/admin/seo/` | Full CRUD for SEO metadata (editor+) |
| `GET` | `/api/admin/audit-logs/` | Paginated audit log (admin-only) |

---

## 📂 Project Structure

```
My-Portfolio/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # 5-stage CI/CD pipeline (lint → test → build → preview → deploy)
│   ├── dependabot.yml                # Automated dependency updates (npm × 2 + pip)
│   └── SECURITY.md                   # Vulnerability disclosure policy
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, middleware, router mounting, health endpoints
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic Settings with production validators
│   │   │   ├── database.py           # SQLAlchemy engine, session factory, get_db dependency
│   │   │   ├── security.py           # Argon2/bcrypt hashing, JWT creation/decode, refresh tokens
│   │   │   ├── rate_limit.py         # SlowAPI limiter (IP-keyed)
│   │   │   ├── logging.py            # Structured JSON log formatter
│   │   │   └── slugify.py            # URL-safe slug generator
│   │   ├── models/                   # SQLAlchemy ORM models (10 tables)
│   │   ├── schemas/                  # Pydantic v2 request/response schemas
│   │   ├── routers/
│   │   │   ├── public/               # Unauthenticated read endpoints
│   │   │   └── admin/                # JWT-protected CRUD + auth + audit
│   │   ├── services/                 # Business logic (auth, projects, blog, media, audit)
│   │   ├── repositories/             # Data access layer (project, blog_post)
│   │   └── dependencies/             # FastAPI DI: get_current_user, require_role
│   ├── alembic/
│   │   └── versions/                 # 4 migration revisions (initial → featured → storage → audit)
│   ├── scripts/                      # Seed scripts (admin, projects, skills, portfolio content)
│   ├── tests/
│   │   ├── test_api_smoke.py         # 10 integration tests against real PostgreSQL
│   │   └── test_config.py            # Production config validation tests
│   ├── Dockerfile                    # Multi-stage: builder → test → production (non-root)
│   ├── healthcheck.py                # Docker HEALTHCHECK script (liveness probe)
│   ├── requirements.txt              # Production dependencies
│   └── requirements-dev.txt          # Test dependencies (pytest, httpx)
│
├── frontend/
│   ├── src/
│   │   ├── router.tsx                # Lazy-loaded route definitions (11 routes)
│   │   ├── SiteLayout.tsx            # Persistent header/footer/status bar shell
│   │   ├── PageMeta.tsx              # Per-page SEO via react-helmet-async
│   │   ├── ErrorBoundary.tsx         # React error boundary
│   │   └── pages/                    # Home, Projects, Skills, Experience, Blog, Resume, Contact, Admin
│   ├── components/
│   │   ├── admin/                    # Admin dashboard: AuthGuard, AdminShell, CRUD tabs/forms
│   │   ├── ContactForm.tsx           # Public contact form
│   │   ├── ProjectCard.tsx           # Project display card
│   │   ├── ThemeProvider.tsx          # Dark/light theme context
│   │   └── ThemeToggle.tsx           # Theme switch button
│   ├── context/
│   │   └── AuthContext.tsx           # JWT auth state, login/logout, silent refresh on mount
│   ├── lib/api/
│   │   ├── client.ts                 # Axios client with auth interceptors & refresh rotation
│   │   ├── config.ts                 # API base URL from VITE_API_URL
│   │   └── *.ts                      # Typed API modules (projects, blogPosts, media, etc.)
│   ├── types/                        # TypeScript interfaces (Project, BlogPost, Media, etc.)
│   ├── Dockerfile                    # Multi-stage: node build → nginx-unprivileged
│   ├── nginx.conf                    # SPA fallback + /healthz endpoint
│   ├── vercel.json                   # SPA rewrite rules for Vercel
│   ├── vite.config.ts                # Dev server proxy (/api → backend:8002)
│   ├── eslint.config.mjs             # ESLint 9 flat config with TypeScript parser
│   ├── tsconfig.json                 # Strict TypeScript with path aliases (@/*)
│   └── package.json                  # React 19, Vite 8, Tailwind v4, Axios, etc.
│
├── docker-compose.yml                # Full-stack local dev: Postgres 16 + Backend + Frontend
├── render.yaml                       # Render Blueprint: Docker service, env vars, health checks
├── .env.example                      # Environment variable template (no secrets)
├── LICENSE                           # MIT License
└── README.md                         # ← You are here
```

---

## ⚡ Local Development & Docker Quickstart

### Option 1: Docker Compose (Recommended)

One command spins up the full stack — PostgreSQL 16, FastAPI backend with auto-migrations, and Nginx-served frontend:

```bash
# 1. Clone the repository
git clone https://github.com/Kamal-kishor1/My-Portfolio.git
cd My-Portfolio

# 2. Create your .env from the template
cp .env.example .env

# 3. Set required values in .env
#    POSTGRES_PASSWORD=your-local-password
#    JWT_SECRET_KEY=your-random-32-char-string
#    SECRET_KEY=another-random-32-char-string

# 4. Start the full stack
docker compose up --build
```

| Service | URL | Health Check |
| :--- | :--- | :--- |
| Frontend | [http://localhost:3001](http://localhost:3001) | `GET /healthz` |
| Backend API | [http://localhost:8002](http://localhost:8002) | `GET /health` |
| PostgreSQL | `localhost:5432` | `pg_isready` |

The backend container runs `alembic upgrade head` on every startup — a fresh `docker compose up` on a clean database just works.

### Option 2: Manual Local Setup

#### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL to your local PostgreSQL instance
# DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/portfolio

# Run migrations
alembic upgrade head

# (Optional) Seed admin user
python scripts/seed.py

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Start dev server (proxies /api → localhost:8002)
npm run dev
```

The Vite dev server starts on [http://localhost:3001](http://localhost:3001) with built-in API proxy to the backend.

---

## 🧪 Testing

The test suite runs integration tests against a **real PostgreSQL 16 instance** — no SQLite substitutes or mocked database layers:

```bash
cd backend

# Requires a test database (CI uses a service container)
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/portfolio_test \
  python -m pytest -v
```

**Test Coverage Includes:**
* Health, liveness, and readiness probes with security header validation
* Public endpoint reads (projects, blog posts, resume)
* Contact form payload validation and rate limiting
* Full admin auth flow: login → refresh token rotation → logout
* Origin-based CSRF protection in production mode
* httpOnly/Secure/SameSite cookie attributes verification
* Concurrent refresh token rotation (race condition test with `SELECT ... FOR UPDATE`)
* Complete CRUD lifecycle for projects, blog posts, resume entries, and SEO metadata
* Admin audit log creation and RBAC enforcement (editor vs. admin)
* Media upload: magic byte validation, file size limits, storage failure handling
* Referential integrity: media-in-use deletion prevention (409 Conflict)
* Production config rejection for weak secrets and HTTP origins

---

## 🛠️ Tech Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5, Vite 8, Tailwind CSS v4, react-router-dom v7, Axios, react-markdown, remark-gfm, react-helmet-async, Lucide React |
| **Backend** | FastAPI 0.115, Python 3.12, Pydantic v2, SQLAlchemy 2.0, Alembic 1.14, Uvicorn, SlowAPI |
| **Authentication** | PyJWT (HS256), Argon2-cffi, Passlib, SHA-256 refresh token hashing |
| **Database** | PostgreSQL 16, Neon Serverless (production), psycopg2 |
| **Object Storage** | Neon Object Storage (S3-compatible), boto3, presigned URLs |
| **Testing** | pytest 9, httpx, FastAPI TestClient |
| **Infrastructure** | Docker (multi-stage builds), Docker Compose, nginx-unprivileged |
| **CI/CD** | GitHub Actions (5-stage pipeline), Vercel CLI, Render Deploy Hooks |
| **Security** | Dependabot (npm + pip), SECURITY.md, secret scanning, push protection |

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

Copyright © 2026 Kamal Kishor
