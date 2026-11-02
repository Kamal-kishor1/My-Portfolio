import { apiFetch } from "./client";
import { API_PREFIX } from "./config";
import type { Project, ProjectInput } from "@/types/project";

// Matches routers/admin/projects.py exactly: prefix="/admin/projects",
// list/create at "/", single item at "/{project_id}", updates are PATCH.
const BASE = `${API_PREFIX}/admin/projects`;

export async function listProjects(): Promise<Project[]> {
  const res = await apiFetch(`${BASE}/`);
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
  return res.json();
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const res = await apiFetch(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create project (${res.status})`);
  return res.json();
}

export async function updateProject(
  id: number,
  input: Partial<ProjectInput>
): Promise<Project> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update project (${res.status})`);
  return res.json();
}

export async function deleteProject(id: number): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete project (${res.status})`);
}
