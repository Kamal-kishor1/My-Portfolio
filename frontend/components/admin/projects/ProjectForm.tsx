"use client";

import { useState } from "react";
import type { Project, ProjectInput } from "@/types/project";
import { EMPTY_PROJECT_INPUT } from "@/types/project";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project: Project | null;
  onSave: (input: ProjectInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [prevProject, setPrevProject] = useState(project);
  const [input, setInput] = useState<ProjectInput>(() =>
    project
      ? {
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          tech_stack: project.tech_stack,
          repo_url: project.repo_url,
          live_url: project.live_url,
          cover_image_id: project.cover_image_id,
          featured: project.featured,
          published: project.published,
        }
      : EMPTY_PROJECT_INPUT
  );
  const [slugTouched, setSlugTouched] = useState(() => Boolean(project));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (project !== prevProject) {
    setPrevProject(project);
    setInput(
      project
        ? {
            title: project.title,
            slug: project.slug,
            summary: project.summary,
            description: project.description,
            tech_stack: project.tech_stack,
            repo_url: project.repo_url,
            live_url: project.live_url,
            cover_image_id: project.cover_image_id,
            featured: project.featured,
            published: project.published,
          }
        : EMPTY_PROJECT_INPUT
    );
    setSlugTouched(Boolean(project));
  }

  function set<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="admin-modal-panel flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border p-6 shadow-2xl">
        
        {/* Sticky Header */}
        <div className="admin-modal-divider mb-4 flex shrink-0 items-center justify-between border-b pb-3">
          <h2 className="font-mono text-sm font-bold tracking-[0.15em] text-[var(--admin-text)]">
            {project ? "EDIT PROJECT" : "NEW PROJECT"}
          </h2>
          <button onClick={onCancel} className="admin-modal-secondary font-mono text-xs font-semibold transition-colors">
            ESC ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-5" style={{ scrollbarWidth: "thin" }}>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="TITLE" value={input.title} onChange={handleTitleChange} required autoFocus />
              <TextField
                label="SLUG"
                value={input.slug}
                onChange={(v) => {
                  setSlugTouched(true);
                  set("slug", v);
                }}
                required
              />
            </div>

            <TextField
              label="SUMMARY (short, for cards/lists)"
              value={input.summary ?? ""}
              onChange={(v) => set("summary", v || null)}
            />

            <TextAreaField
              label="DESCRIPTION (full)"
              value={input.description ?? ""}
              onChange={(v) => set("description", v || null)}
              rows={5}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="REPO URL"
                value={input.repo_url ?? ""}
                onChange={(v) => set("repo_url", v || null)}
                type="url"
              />
              <TextField
                label="LIVE URL"
                value={input.live_url ?? ""}
                onChange={(v) => set("live_url", v || null)}
                type="url"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="TECH STACK (comma separated)"
                value={(input.tech_stack ?? []).join(", ")}
                onChange={(v) =>
                  set(
                    "tech_stack",
                    v.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : null
                  )
                }
              />
              <TextField
                label="COVER IMAGE ID"
                value={input.cover_image_id === null ? "" : String(input.cover_image_id)}
                onChange={(v) => set("cover_image_id", v ? Number(v) : null)}
                type="number"
                min="0"
              />
            </div>

            {project?.cover_image_url && (
              <img
                src={project.cover_image_url}
                alt="Cover Preview"
                className="h-32 w-full rounded-md border border-[var(--admin-border)] object-cover shadow-sm"
              />
            )}
          </div>

          {/* Sticky Footer */}
          <div className="admin-modal-divider mt-4 flex shrink-0 flex-col gap-4 border-t bg-inherit pt-4">
            {error && (
              <p className="admin-modal-error rounded-md border px-4 py-3 font-mono text-xs">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-row items-center gap-6">
                <ToggleSwitch
                  label="FEATURED"
                  checked={input.featured}
                  onChange={(checked) => set("featured", checked)}
                />
                <ToggleSwitch
                  label="PUBLISHED"
                  checked={input.published}
                  onChange={(checked) => set("published", checked)}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="admin-modal-secondary px-4 py-2 font-mono text-xs font-semibold transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving || !input.title || !input.slug}
                  className="admin-modal-primary rounded-md px-4 py-2 font-mono text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "SAVING…" : "SAVE PROJECT"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input type="checkbox" className="admin-modal-toggle-input peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="admin-modal-toggle-track relative h-5 w-9 rounded-full transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:translate-x-0 after:rounded-full after:border after:transition-transform after:content-[''] peer-checked:after:translate-x-full"></div>
      </div>
      <span className="font-mono text-xs font-semibold tracking-wider text-[var(--admin-text-muted)]">{label}</span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoFocus,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  min?: string | number;
}) {
  const labelMain = label.split(" (")[0];
  const labelSub = label.includes(" (") ? " (" + label.split(" (")[1] : "";

  return (
    <label className="block w-full">
      <span className="admin-modal-label mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider">
        {labelMain}
        {labelSub && <span className="ml-1 font-normal opacity-80">{labelSub}</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        autoFocus={autoFocus}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="admin-modal-field w-full rounded-md px-3 py-2 font-mono text-sm outline-none transition-colors"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const labelMain = label.split(" (")[0];
  const labelSub = label.includes(" (") ? " (" + label.split(" (")[1] : "";

  return (
    <label className="block w-full">
      <span className="admin-modal-label mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider">
        {labelMain}
        {labelSub && <span className="ml-1 font-normal opacity-80">{labelSub}</span>}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="admin-modal-field w-full resize-none rounded-md px-3 py-2 font-mono text-sm outline-none transition-colors"
      />
    </label>
  );
}

