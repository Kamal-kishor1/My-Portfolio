import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { ContactMessage } from "@/types/contactMessage";

// Matches routers/admin/contact_messages.py: prefix="/admin/contact-messages".
// No create (submissions come from the public contact form). No "unmark as
// read" — the only mutation endpoint is PATCH /{id}/read, which always
// sets is_read=true and takes no body.
const BASE = `${API_PREFIX}/admin/contact-messages`;

export async function listMessages(): Promise<ContactMessage[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
  return res.json();
}

export async function markMessageRead(id: number): Promise<ContactMessage> {
  const res = await apiFetch(`${BASE}/${id}/read`, { method: "PATCH" });
  if (!res.ok) throw new Error(`Failed to update message (${res.status})`);
  return res.json();
}

export async function deleteMessage(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete message (${res.status})`);
}
