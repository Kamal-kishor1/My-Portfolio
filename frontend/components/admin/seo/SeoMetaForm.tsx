"use client";

import { useState } from "react";
import type { SeoEntityType, SeoMeta, SeoMetaInput } from "@/types/seoMeta";
import { EMPTY_SEO_INPUT } from "@/types/seoMeta";

const ENTITY_TYPES: SeoEntityType[] = ["project", "blog_post", "site"];
const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

export function SeoMetaForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: SeoMeta | null; // null = creating new
  onSave: (input: SeoMetaInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [prevEntry, setPrevEntry] = useState(entry);
  const [input, setInput] = useState<SeoMetaInput>(() =>
    entry
      ? {
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          title: entry.title,
          description: entry.description,
          og_image_id: entry.og_image_id,
        }
      : EMPTY_SEO_INPUT
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (entry !== prevEntry) {
    setPrevEntry(entry);
    setInput(
      entry
        ? {
            entity_type: entry.entity_type,
            entity_id: entry.entity_id,
            title: entry.title,
            description: entry.description,
            og_image_id: entry.og_image_id,
          }
        : EMPTY_SEO_INPUT
    );
  }

  function set<K extends keyof SeoMetaInput>(key: K, value: SeoMetaInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function handleEntityTypeChange(t: SeoEntityType) {
    set("entity_type", t);
    if (t === "site") set("entity_id", null); // site-wide defaults have no entity_id
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
            {entry ? "EDIT SEO META" : "NEW SEO META"}
          </h2>
          <button onClick={onCancel} className="font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ESC ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-5" style={{ scrollbarWidth: "thin" }}>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block w-full">
                <span className="mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  ENTITY TYPE
                </span>
                <select
                  value={input.entity_type}
                  onChange={(e) => handleEntityTypeChange(e.target.value as SeoEntityType)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
                >
                  {ENTITY_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              {input.entity_type !== "site" && (
                <Field
                  label={`${input.entity_type.toUpperCase()} ID`}
                  type="number"
                  value={input.entity_id === null ? "" : String(input.entity_id)}
                  onChange={(v) => set("entity_id", v ? Number(v) : null)}
                  required
                  autoFocus
                />
              )}
            </div>

            <div className="relative">
              <Field label="TITLE" value={input.title ?? ""} onChange={(v) => set("title", v || null)} />
              <CharCount value={input.title ?? ""} limit={TITLE_LIMIT} />
            </div>

            <div className="relative">
              <TextArea
                label="DESCRIPTION"
                value={input.description ?? ""}
                onChange={(v) => set("description", v || null)}
                rows={4}
              />
              <CharCount value={input.description ?? ""} limit={DESC_LIMIT} />
            </div>

            <Field
              label="OG IMAGE ID (from Media tab)"
              type="number"
              value={input.og_image_id === null ? "" : String(input.og_image_id)}
              onChange={(v) => set("og_image_id", v ? Number(v) : null)}
            />

            <div className="rounded-md border border-zinc-200 bg-zinc-100 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.15em] text-zinc-500 uppercase">SEARCH PREVIEW</p>
              <p className="truncate text-base text-blue-600 dark:text-[#8ab4f8]">{input.title || "Page title"}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-500">
                {input.entity_type}
                {input.entity_id !== null ? ` #${input.entity_id}` : " (site-wide)"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {input.description || "Meta description will appear here."}
              </p>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="mt-4 flex shrink-0 flex-col gap-4 border-t border-zinc-200 bg-inherit pt-4 dark:border-zinc-800">
            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 font-mono text-xs font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving || (input.entity_type !== "site" && input.entity_id === null)}
                className="rounded-md bg-emerald-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                {saving ? "SAVING…" : "SAVE META"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function CharCount({ value, limit }: { value: string; limit: number }) {
  const over = value.length > limit;
  return (
    <span className={`absolute right-0 top-0 font-mono text-[10px] font-semibold ${over ? "text-red-500 dark:text-red-400" : "text-zinc-400 dark:text-zinc-500"}`}>
      {value.length} / {limit}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  const labelMain = label.split(" (")[0];
  const labelSub = label.includes(" (") ? " (" + label.split(" (")[1] : "";

  return (
    <label className="block w-full relative">
      <span className="mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        {labelMain}
        {labelSub && <span className="ml-1 font-normal opacity-80">{labelSub}</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
      />
    </label>
  );
}

function TextArea({
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
    <label className="block w-full relative">
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
