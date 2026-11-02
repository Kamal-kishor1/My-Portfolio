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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Sticky Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <h2 className="font-mono text-sm font-bold tracking-[0.15em] text-zinc-900 dark:text-zinc-100">
            {project ? "EDIT PROJECT" : "NEW PROJECT"}
          </h2>
          <button onClick={onCancel} className="font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
                className="h-32 w-full rounded-md border border-zinc-200 object-cover shadow-sm dark:border-zinc-800"
              />
            )}
          </div>

          {/* Sticky Footer */}
          <div className="mt-4 flex shrink-0 flex-col gap-4 border-t border-zinc-200 bg-inherit pt-4 dark:border-zinc-800">
            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-600 dark:text-red-400">
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
                  className="px-4 py-2 font-mono text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving || !input.title || !input.slug}
                  className="rounded-md bg-emerald-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
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
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="h-5 w-9 rounded-full bg-zinc-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] dark:bg-zinc-700 dark:peer-checked:bg-emerald-500"></div>
      </div>
      <span className="font-mono text-xs font-semibold tracking-wider text-zinc-600 dark:text-zinc-300">{label}</span>
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
      <span className="mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
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
        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
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
      <span className="mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {labelMain}
        {labelSub && <span className="ml-1 font-normal opacity-80">{labelSub}</span>}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
      />
    </label>
  );
}

