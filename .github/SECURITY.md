# Security Policy

## Supported versions

Only the latest version on the `main` branch is currently supported.

## Reporting a vulnerability

Please report suspected vulnerabilities through GitHub's private vulnerability reporting feature for this repository. Do not include sensitive vulnerability details in a public issue. If private reporting is unavailable, contact the maintainer privately through their GitHub profile.

## Repository security automation

- GitHub Actions runs frontend lint, type checking, and production builds.
- GitHub Actions runs backend tests against PostgreSQL.
- Dependabot is configured to check npm dependencies at the repository root and in `frontend/`, and Python dependencies in `backend/`.

Secret scanning, push protection, Dependabot alerts, and other GitHub security settings are controlled by repository settings and are not asserted here.
