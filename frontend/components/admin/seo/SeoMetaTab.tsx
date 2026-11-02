"use client";

import { useEffect, useState } from "react";
import type { SeoMeta, SeoMetaInput } from "@/types/seoMeta";
import { createSeoMeta, deleteSeoMeta, listSeoMeta, updateSeoMeta } from "@/lib/api/seoMeta";
import { SeoMetaForm } from "./SeoMetaForm";
import { Skeleton } from "../Skeleton";

type FormState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; entry: SeoMeta };

export function SeoMetaTab() {
  const [entries, setEntries] = useState<SeoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ mode: "closed" });
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listSeoMeta();
      setEntries(
        data.sort((a, b) => a.entity_type.localeCompare(b.entity_type) || (a.entity_id ?? 0) - (b.entity_id ?? 0))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SEO meta.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listSeoMeta();
        if (cancelled) return;
        setEntries(
          data.sort((a, b) => a.entity_type.localeCompare(b.entity_type) || (a.entity_id ?? 0) - (b.entity_id ?? 0))
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load SEO meta.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(input: SeoMetaInput) {
    if (form.mode === "edit") {
      await updateSeoMeta(form.entry.id, input);
    } else {
      await createSeoMeta(input);
    }
    setForm({ mode: "closed" });
    await refresh();
  }

  async function handleDelete(id: number) {
    try {
      await deleteSeoMeta(id);
      setConfirmingDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete entry.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">SEO META ({entries.length})</h1>
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
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>ENTITY</Th>
                <Th>TITLE</Th>
                <Th>DESCRIPTION</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-3"><Skeleton className="h-4 w-10" /><Skeleton className="h-4 w-12" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO SEO ENTRIES YET</span>
          <span>Click + NEW ENTRY to add one</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--admin-border)]">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--admin-border)] text-left text-[var(--admin-text-muted)]">
                <Th>ENTITY</Th>
                <Th>TITLE</Th>
                <Th>DESCRIPTION</Th>
                <Th className="text-right">ACTIONS</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3 text-[var(--admin-accent)]">
                    {e.entity_type}
                    {e.entity_id !== null ? ` #${e.entity_id}` : ""}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[var(--admin-text)]">{e.title ?? "—"}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-[var(--admin-text-muted)]">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form.mode !== "closed" && (
        <SeoMetaForm
          entry={form.mode === "edit" ? form.entry : null}
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
