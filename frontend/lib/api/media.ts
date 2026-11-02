import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { MediaItem } from "@/types/media";

const BASE = `${API_PREFIX}/admin/media`;

export interface RegisterMediaInput {
  filename: string;
  url: string;
  alt_text: string | null;
}

export async function listMedia(): Promise<MediaItem[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load media (${res.status})`);
  return res.json();
}

export async function registerMedia(input: RegisterMediaInput): Promise<MediaItem> {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to register ${input.filename} (${res.status})`);
  return res.json();
}

export async function uploadMedia(file: File, altText: string): Promise<MediaItem> {
  const form = new FormData();
  form.append("file", file);
  if (altText.trim()) form.append("alt_text", altText.trim());
  const res = await apiFetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Failed to upload ${file.name} (${res.status})`);
  return res.json();
}

export async function deleteMedia(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete media (${res.status})`);
}
