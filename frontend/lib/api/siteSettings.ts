import { apiFetch } from "./client";
import { API_PREFIX } from "./config";

const BASE = `${API_PREFIX}/admin/site-settings`;

export type AdminSiteSettings = {
  contact_email: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  open_to_work_enabled: boolean;
  open_to_work_text: string;
  resume_pdf_media_id: number | null;
  resume_available: boolean;
};

export type AdminSiteSettingsUpdate = Omit<AdminSiteSettings, "resume_available">;

export async function getAdminSiteSettings(): Promise<AdminSiteSettings> {
  const response = await apiFetch(`${BASE}/`);
  if (!response.ok) throw new Error(`Failed to load site settings (${response.status})`);
  return response.json();
}

export async function saveAdminSiteSettings(input: AdminSiteSettingsUpdate): Promise<AdminSiteSettings> {
  const response = await apiFetch(`${BASE}/`, { method: "PUT", body: JSON.stringify(input) });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? `Failed to save site settings (${response.status})`);
  }
  return response.json();
}
