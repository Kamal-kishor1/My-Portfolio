// Admin routers are mounted under /api in backend/app/main.py.
export const API_PREFIX = "/api";

export function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? "";
}
