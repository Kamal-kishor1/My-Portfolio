# Portfolio Frontend (React + Vite)

React single-page frontend for the FastAPI backend. Tailwind CSS v4, the existing UI, admin dashboard, auth flow, forms and API contract are retained.

## Routes

`/`, `/projects`, `/blog`, `/blog/:slug`, `/resume`, `/contact`, `/admin/login`, and protected `/admin/*`.

Pages are lazy-loaded through React Router. The Vercel rewrite in `vercel.json` enables direct route loads; the Nginx SPA fallback remains for the Docker/Compose frontend.

## Local setup

Set `VITE_API_URL` when the API is not served at the same origin. If unset, Vite proxies API calls to `http://127.0.0.1:8002`.

```sh
npm ci
npm run dev
```

Vite listens on port `3001`. Run `npm run type-check`, `npm run lint`, and `npm run build` for validation.

## Hosted deployment

For Vercel, set Root Directory to `frontend`, build command `npm run build`, output directory `dist`, and `VITE_API_URL` to the Render API origin. Set the matching Vercel origin in the Render `ALLOWED_ORIGINS` value. See [Deployment.md](../Project-docs/Deployment.md).

## Media status

The media admin supports uploading JPEG, PNG, GIF, WebP and PDF files (up to 10 MiB) to Neon Object Storage, as well as registering externally hosted URLs. The backend returns expiring signed URLs for private objects; storage credentials never belong in frontend environment variables.
