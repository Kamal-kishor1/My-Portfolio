"use client";

import { useEffect, useState } from "react";
import type { Project, ProjectInput } from "@/types/project";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/api/projects";
import { ProjectForm } from "./ProjectForm";
import { StatusBadge } from "../StatusBadge";
import { Skeleton } from "../Skeleton";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; project: Project };

export function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listProjects();
      setProjects(
        data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listProjects();
        if (cancelled) return;
        setProjects(
          data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load projects.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(input: ProjectInput) {
    if (form.mode === "edit") {
      await updateProject(form.project.id, input);
    } else {
      await createProject(input);
    }
    setForm({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: number) {
    try {
      await deleteProject(id);
      setConfirmingDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">PROJECTS ({projects.length})</h1>
        <button
          onClick={() => setForm({ mode: "create" })}
          className="rounded bg-[var(--admin-accent)] px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90"
        >
          + NEW PROJECT
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>TITLE</Th>
                <Th>SUMMARY</Th>
                <Th>FEATURED</Th>
                <Th>PUBLISHED</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-3"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-12" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO PROJECTS YET</span>
          <span>Click + NEW PROJECT to add one</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>TITLE</Th>
                <Th>SUMMARY</Th>
                <Th>FEATURED</Th>
                <Th>PUBLISHED</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3 text-[var(--admin-text)]">{p.title}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-[var(--admin-text-muted)]">{p.summary ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.featured ? <StatusBadge tone="positive" label="featured" /> : <span className="text-[var(--admin-text-faint)]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={p.published ? "positive" : "neutral"} label={p.published ? "published" : "draft"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setForm({ mode: "edit", project: p })}
                      className="mr-3 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                    >
                      EDIT
                    </button>
                    {confirmingDelete === p.id ? (
                      <button onClick={() => handleDelete(p.id)} className="text-[var(--admin-danger)]">
                        CONFIRM?
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmingDelete(p.id)}
                        onBlur={() => setConfirmingDelete(null)}
                        className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                      >
                        DELETE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form.mode !== "closed" && (
        <ProjectForm
          project={form.mode === "edit" ? form.project : null}
          onSave={handleSave}
          onCancel={() => setForm({ mode: "closed" })}
        />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-normal tracking-[0.1em] ${className}`}>{children}</th>;
}
