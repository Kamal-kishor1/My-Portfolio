"use client";

import { useEffect, useState } from "react";
import type { ResumeEntry, ResumeEntryInput, ResumeType } from "@/types/resumeEntry";
import {
  createResumeEntry,
  deleteResumeEntry,
  listResumeEntries,
  updateResumeEntry,
} from "@/lib/api/resumeEntries";
import { ResumeEntryForm } from "./ResumeEntryForm";
import { Skeleton } from "../Skeleton";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; entry: ResumeEntry };

function formatRange(start: string | null, end: string | null): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  const s = start ? fmt(start) : "—";
  const e = end ? fmt(end) : "Present";
  return `${s} – ${e}`;
}

export function ResumeTab({ entryTypes, title = "RESUME" }: { entryTypes?: ResumeType[]; title?: string }) {
  const [entries, setEntries] = useState<ResumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listResumeEntries();
      setEntries(data.sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listResumeEntries();
        if (cancelled) return;
        setEntries(data.sort((a, b) => a.sort_order - b.sort_order));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load entries.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(input: ResumeEntryInput) {
    const value = entryTypes?.length === 1 ? { ...input, type: entryTypes[0] } : input;
    if (form.mode === "edit") {
      await updateResumeEntry(form.entry.id, value);
    } else {
      await createResumeEntry(value);
    }
    setForm({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: number) {
    try {
      await deleteResumeEntry(id);
      setConfirmingDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    }
  }

  const visibleEntries = entryTypes ? entries.filter((entry) => entryTypes.includes(entry.type)) : entries;
  const groups: Record<string, ResumeEntry[]> = {};
  for (const e of visibleEntries) {
    (groups[e.type] ??= []).push(e);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">{title} ({visibleEntries.length})</h1>
        <button
          onClick={() => setForm({ mode: "create" })}
          className="rounded bg-[var(--admin-accent)] px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90"
        >
          + NEW ENTRY
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[var(--admin-text-muted)]"><Skeleton className="h-3 w-16" /></h2>
            <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 last:border-0">
                  <div>
                    <Skeleton className="mb-1 h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO RESUME ENTRIES YET</span>
          <span>Click + NEW ENTRY to add one</span>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([type, items]) => (
            <div key={type}>
              <h2 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-[var(--admin-text-muted)]">{type.toUpperCase()}</h2>
              <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
                {items.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 font-mono text-xs last:border-0"
                  >
                    <div>
                      <div className="text-[var(--admin-text)]">
                        {e.title}
                        {e.organization && <span className="text-[var(--admin-text-muted)]"> · {e.organization}</span>}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[var(--admin-text-muted)]">
                        {formatRange(e.start_date, e.end_date)}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setForm({ mode: "edit", entry: e })}
                        className="mr-3 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
                      >
                        EDIT
                      </button>
                      {confirmingDelete === e.id ? (
                        <button onClick={() => handleDelete(e.id)} className="text-[var(--admin-danger)]">
                          CONFIRM?
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmingDelete(e.id)}
                          onBlur={() => setConfirmingDelete(null)}
                          className="text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                        >
                          DELETE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {form.mode !== "closed" && (
        <ResumeEntryForm
          entry={form.mode === "edit" ? form.entry : null}
          allowedTypes={entryTypes}
          defaultType={entryTypes?.length === 1 ? entryTypes[0] : undefined}
          onSave={handleSave}
          onCancel={() => setForm({ mode: "closed" })}
        />
      )}
    </div>
  );
}
