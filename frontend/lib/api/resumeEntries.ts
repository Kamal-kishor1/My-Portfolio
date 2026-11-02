import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { ResumeEntry, ResumeEntryInput } from "@/types/resumeEntry";

// Matches routers/admin/resume_entries.py: prefix="/admin/resume-entries",
// list/create at "/", single item at "/{entry_id}", updates are PATCH.
const BASE = `${API_PREFIX}/admin/resume-entries`;

export async function listResumeEntries(): Promise<ResumeEntry[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load resume entries (${res.status})`);
  return res.json();
}

export async function createResumeEntry(input: ResumeEntryInput): Promise<ResumeEntry> {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create entry (${res.status})`);
  return res.json();
}

export async function updateResumeEntry(
  id: number,
  input: Partial<ResumeEntryInput>
): Promise<ResumeEntry> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update entry (${res.status})`);
  return res.json();
}

export async function deleteResumeEntry(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete entry (${res.status})`);
}
