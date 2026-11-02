import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { SeoMeta, SeoMetaInput } from "@/types/seoMeta";

// Matches routers/admin/seo_meta.py: prefix="/admin/seo" (NOT "/admin/seo-meta"),
// list/create at "/", single item at "/{seo_id}", updates are PATCH.
// One record per (entity_type, entity_id) pair — the backend returns 409
// on POST if one already exists; surfaced as a normal thrown Error here.
const BASE = `${API_PREFIX}/admin/seo`;

export async function listSeoMeta(): Promise<SeoMeta[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load SEO meta (${res.status})`);
  return res.json();
}

export async function createSeoMeta(input: SeoMetaInput): Promise<SeoMeta> {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (res.status === 409) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "An SEO entry already exists for this entity — edit it instead.");
  }
  if (!res.ok) throw new Error(`Failed to create entry (${res.status})`);
  return res.json();
}

export async function updateSeoMeta(id: number, input: Partial<SeoMetaInput>): Promise<SeoMeta> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update entry (${res.status})`);
  return res.json();
}

export async function deleteSeoMeta(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete entry (${res.status})`);
}
