# Deployment runbook

This guide covers the portfolio API and frontend. Do not run database migrations against production until the same migration has passed on a disposable Neon branch and a current backup is available.

## 1. Validate the migration on a Neon branch

1. In Neon, create a temporary branch from the intended production branch. Keep its connection strings separate from production.
2. Point a staging API instance at the temporary branch with `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Use a test object-storage bucket and `CONTACT_NOTIFICATION_DRY_RUN=true`; never use a real Resend key for this test.
3. From the backend release environment, run `alembic upgrade head`, then `alembic current`. Confirm the current revision is `a5c27d91e682`.
4. Check that existing `site_settings` values remain unchanged except the exact old default badge text. The migration only changes that exact old default; custom badge text is preserved.
5. Exercise `/health`, `/api/site-settings`, and `/api/resume/download` on the staging API. Confirm the public settings response contains only its public allowlist and the resume route returns JSON 404 while no PDF is selected.
6. Remove the temporary branch and staging resources after sign-off.

## 2. Prepare and migrate the main database

1. Confirm a recent Neon backup/restore point and record the current migration revision.
2. Set the backend variables listed below in the API service. Keep secrets in the host's secret settings, never in the frontend build environment.
3. Run `alembic upgrade head` against the main database using its unpooled migration URL (`DATABASE_URL_UNPOOLED`). The Render pre-deploy command is configured as `alembic upgrade head`.
4. Verify `alembic current` reports `a5c27d91e682`, then deploy the backend and frontend code. The API startup warning will identify a missing production Resend API key.
5. In the admin panel, upload `Kamal_Kishor_Resume.pdf` under Media, then select it in Site Settings. Verify the public button visibility and attachment download before announcing the site update.

## 3. Environment variables

Set only the variables needed by each service. Values are intentionally omitted here.

| Service | Variable names |
| --- | --- |
| Backend API | `ENVIRONMENT`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `JWT_SECRET_KEY`, `SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_PUBLIC_ENDPOINT_URL_S3` (optional), `AWS_REGION`, `NEON_STORAGE_BUCKET`, `LOGIN_RATE_LIMIT`, `CONTACT_RATE_LIMIT`, `ANALYTICS_RATE_LIMIT`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_NOTIFICATION_TO`, `CONTACT_NOTIFICATION_DRY_RUN`, `TRUST_CLOUDFLARE_CLIENT_IP` |
| Frontend | `VITE_API_URL` |
| Local Docker only | `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `API_PORT`, `FRONTEND_PORT`, `LOCAL_S3_PORT` |

For production, set `CONTACT_NOTIFICATION_DRY_RUN=false`. Set `TRUST_CLOUDFLARE_CLIENT_IP=true` only when Cloudflare is the trusted edge and overwrites `CF-Connecting-IP`. With it off, the API uses the immediate socket peer; if every request arrives through one proxy address, all visitors share one per-IP rate-limit bucket.

## 4. Rollback

To revert only the latest badge wording migration while keeping the site-settings table and its data, run this from the backend release environment against the same main database:

```sh
alembic downgrade 4f80a2c173b1
alembic current
```

The downgrade changes the badge back only when its value is still the new default; a customized value is preserved. Then roll the API and frontend back to the matching previous code release. Do not downgrade below `4f80a2c173b1` as a routine rollback: that earlier migration owns the `site_settings` table, and its downgrade drops that table and its settings. For a broader rollback, restore the database backup using the host's documented restore procedure, then deploy matching application code.

## 5. Post-deploy smoke checklist

- `GET /health` returns 200 with `database: connected` and a fresh UTC `checked_at`.
- `GET /api/site-settings` returns only public keys and never contains the admin login email.
- The home badge matches the configured enabled/text values.
- The résumé link appears only when a PDF is selected; downloading returns an attachment named `Kamal_Kishor_Resume.pdf`.
- Contact validation rejects invalid input; a valid message is stored and appears in admin Messages.
- Backend logs show either a Resend attempt/failure or an explicit dry-run/skip message; no API key is exposed in logs.
- Admin Site Settings can update public links and availability text, and can select or clear the résumé PDF.
- Verify rate limits through the real hosting proxy with two independent clients before relying on per-visitor isolation.
