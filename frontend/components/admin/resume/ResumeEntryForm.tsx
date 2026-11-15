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
      className="admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="admin-modal-panel flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border p-6 shadow-2xl">
        
        {/* Sticky Header */}
        <div className="admin-modal-divider mb-4 flex shrink-0 items-center justify-between border-b pb-3">
          <h2 className="font-mono text-sm font-bold tracking-[0.15em] text-[var(--admin-text)]">
            {entry ? "EDIT ENTRY" : "NEW ENTRY"}
          </h2>
          <button onClick={onCancel} className="admin-modal-secondary font-mono text-xs font-semibold transition-colors">
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
                <span className="admin-modal-label mb-1.5 flex font-mono text-xs font-semibold uppercase tracking-wider">
                  CATEGORY (TYPE)
                </span>
                <select
                  value={input.type}
                  onChange={(e) => set("type", e.target.value as ResumeType)}
                  className="admin-modal-field w-full rounded-md px-3 py-2 font-mono text-sm outline-none transition-colors"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="admin-modal-option">
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
          <div className="admin-modal-divider mt-4 flex shrink-0 flex-col gap-4 border-t bg-inherit pt-4">
            {error && (
              <p className="admin-modal-error rounded-md border px-4 py-3 font-mono text-xs">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="admin-modal-secondary px-4 py-2 font-mono text-xs font-semibold transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={saving || !input.title}
                className="admin-modal-primary rounded-md px-4 py-2 font-mono text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
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
        <input type="checkbox" className="admin-modal-toggle-input peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="admin-modal-toggle-track relative h-5 w-9 rounded-full transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:translate-x-0 after:rounded-full after:border after:transition-transform after:content-[''] peer-checked:after:translate-x-full"></div>
      </div>
      <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--admin-text-muted)]">{label}</span>
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
