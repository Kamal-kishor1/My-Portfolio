"use client";

import { useState } from "react";
import type { ResumeEntry, ResumeEntryInput, ResumeType } from "@/types/resumeEntry";
import { EMPTY_RESUME_INPUT } from "@/types/resumeEntry";

const TYPES: ResumeType[] = ["experience", "education", "skill"];

export function ResumeEntryForm({
  entry,
  onSave,
  onCancel,
  allowedTypes,
  defaultType,
}: {
  entry: ResumeEntry | null; // null = creating new
  onSave: (input: ResumeEntryInput) => Promise<void>;
  onCancel: () => void;
  allowedTypes?: ResumeType[];
  defaultType?: ResumeType;
}) {
  const emptyInput = { ...EMPTY_RESUME_INPUT, type: defaultType ?? EMPTY_RESUME_INPUT.type };
  const [prevEntry, setPrevEntry] = useState(entry);
  const [input, setInput] = useState<ResumeEntryInput>(() =>
    entry
      ? {
          type: entry.type,
          title: entry.title,
          organization: entry.organization,
          description: entry.description,
          start_date: entry.start_date,
          end_date: entry.end_date,
          sort_order: entry.sort_order,
        }
      : emptyInput
  );
  const [current, setCurrent] = useState(() => (entry ? entry.end_date === null : false));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (entry !== prevEntry) {
    setPrevEntry(entry);
    setInput(
      entry
        ? {
            type: entry.type,
            title: entry.title,
            organization: entry.organization,
            description: entry.description,
            start_date: entry.start_date,
            end_date: entry.end_date,
            sort_order: entry.sort_order,
          }
          : emptyInput
    );
    setCurrent(entry ? entry.end_date === null : false);
  }

  function set<K extends keyof ResumeEntryInput>(key: K, value: ResumeEntryInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({ ...input, end_date: current ? null : input.end_date });
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
            {entry ? "EDIT ENTRY" : "NEW ENTRY"}
          </h2>
          <button onClick={onCancel} className="font-mono text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            ESC ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto pr-4 space-y-5" style={{ scrollbarWidth: "thin" }}>
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="ORGANIZATION / INSTITUTION"
                value={input.organization ?? ""}
                onChange={(v) => set("organization", v || null)}
                autoFocus
              />
              <TextField label="ROLE / DEGREE" value={input.title} onChange={(v) => set("title", v)} required />
            </div>

            {/* Row 2 (Sort Order & Type instead of Location/Category as per current schema) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="SORT ORDER"
                type="number"
                value={String(input.sort_order)}
                onChange={(v) => set("sort_order", Number(v) || 0)}
                min="0"
              />
              {(!allowedTypes || allowedTypes.length > 1) && <label className="block w-full">
                <span className="mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  CATEGORY (TYPE)
                </span>
                <select
                  value={input.type}
                  onChange={(e) => set("type", e.target.value as ResumeType)}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500 font-mono"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
                      {t}
                    </option>
                  ))}
                </select>
              </label>}
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="START DATE"
                type="date"
                value={input.start_date ?? ""}
                onChange={(v) => set("start_date", v || null)}
              />
              <div className="flex flex-col gap-2">
                <TextField
                  label="END DATE"
                  type="date"
                  value={input.end_date ?? ""}
                  onChange={(v) => set("end_date", v || null)}
                />
                <ToggleSwitch
                  label="CURRENT POSITION / ONGOING"
                  checked={current}
                  onChange={(c) => setCurrent(c)}
                />
              </div>
            </div>

            {/* Row 4 */}
            <TextAreaField
              label="HIGHLIGHTS / DESCRIPTION"
              value={input.description ?? ""}
              onChange={(v) => set("description", v || null)}
              rows={5}
            />
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
                disabled={saving || !input.title}
                className="rounded-md bg-emerald-600 px-4 py-2 font-mono text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                {saving ? "SAVING…" : "SAVE ENTRY"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="mt-1 flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="h-5 w-9 rounded-full bg-zinc-300 peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] dark:bg-zinc-700 dark:peer-checked:bg-emerald-500"></div>
      </div>
      <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-300">{label}</span>
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
