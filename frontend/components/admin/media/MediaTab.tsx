"use client";

import { useEffect, useState } from "react";
import type { MediaItem } from "@/types/media";
import { looksLikeImage } from "@/types/media";
import { deleteMedia, listMedia, registerMedia, uploadMedia } from "@/lib/api/media";
import { Skeleton } from "../Skeleton";

const EMPTY_FORM = { filename: "", url: "", alt_text: "" };

export function MediaTab() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMedia();
      setItems(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listMedia();
        if (cancelled) return;
        setItems(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load media.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRegistering(true);
    try {
      await registerMedia({
        filename: form.filename,
        url: form.url,
        alt_text: form.alt_text || null,
      });
      setForm(EMPTY_FORM);
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register file.");
    } finally {
      setRegistering(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setError(null);
    setUploading(true);
    try {
      await uploadMedia(selectedFile, uploadAltText);
      setSelectedFile(null);
      setUploadAltText("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMedia(id);
      setConfirmingDelete(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file.");
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">MEDIA ({items.length})</h1>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="rounded bg-[var(--admin-accent)] px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90"
        >
          {formOpen ? "CANCEL" : "+ ADD MEDIA"}
        </button>
      </div>

      <p className="mb-4 font-mono text-[10px] leading-relaxed text-[var(--admin-text-faint)]">
        Upload images or PDFs to private Neon Object Storage, or register a URL hosted elsewhere.
        Maximum upload size: 10 MB.
      </p>

      {error && (
        <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
          {error}
        </p>
      )}

      {formOpen && (
        <div className="mb-6 space-y-4 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
        <form onSubmit={handleUpload} className="space-y-3">
          <p className="font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)]">UPLOAD TO NEON STORAGE</p>
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)]">IMAGE OR PDF (MAX 10 MB)</span>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,application/pdf" required
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="w-full font-mono text-xs text-[var(--admin-text)]" />
          </label>
          <Field label="ALT TEXT" value={uploadAltText} onChange={setUploadAltText} />
          <button type="submit" disabled={uploading || !selectedFile}
            className="w-full rounded bg-[var(--admin-accent)] py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            {uploading ? "UPLOADING…" : "UPLOAD"}
          </button>
        </form>
        <div className="border-t border-[var(--admin-border)] pt-4">
        <p className="mb-3 font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)]">OR REGISTER AN EXISTING URL</p>
        <form
          onSubmit={handleRegister}
          className="space-y-3"
        >
          <Field
            label="FILENAME"
            value={form.filename}
            onChange={(v) => setForm((f) => ({ ...f, filename: v }))}
            required
          />
          <Field
            label="URL"
            type="url"
            value={form.url}
            onChange={(v) => setForm((f) => ({ ...f, url: v }))}
            required
          />
          <Field
            label="ALT TEXT"
            value={form.alt_text}
            onChange={(v) => setForm((f) => ({ ...f, alt_text: v }))}
          />
          <button
            type="submit"
            disabled={registering || !form.filename || !form.url}
            className="w-full rounded bg-[var(--admin-accent)] py-2 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--admin-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {registering ? "REGISTERING…" : "REGISTER"}
          </button>
        </form>
        </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-2.5">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-2 w-1/2 mb-2" />
                <Skeleton className="h-2 w-1/3" />
                <div className="mt-2 flex justify-end">
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-1 rounded border border-dashed border-[var(--admin-border)] font-mono text-xs text-[var(--admin-text-faint)]">
          <span>NO FILES YET</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded border border-[var(--admin-border)] bg-[var(--admin-surface)]">
              <div className="flex aspect-video items-center justify-center bg-[var(--admin-bg)]">
                {looksLikeImage(item) ? (
                  <img src={item.url} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mono text-[10px] text-[var(--admin-text-faint)]">FILE</span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate font-mono text-[11px] text-[var(--admin-text)]" title={item.filename}>
                  {item.filename}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--admin-text-faint)]" title={item.alt_text ?? ""}>
                  {item.alt_text || "no alt text"}
                </p>
                <p className="mt-1 font-mono text-[9px] text-[var(--admin-text-faint)]">
                  #{item.id} · {new Date(item.created_at).toLocaleDateString()}
                </p>
                <div className="mt-2 flex justify-end">
                  {confirmingDelete === item.id ? (
                    <button onClick={() => handleDelete(item.id)} className="font-mono text-[10px] text-[var(--admin-danger)]">
                      CONFIRM DELETE?
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmingDelete(item.id)}
                      onBlur={() => setConfirmingDelete(null)}
                      className="font-mono text-[10px] text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--admin-border-strong)] bg-[var(--admin-bg)] px-3 py-2 font-mono text-sm text-[var(--admin-text)] outline-none transition-colors focus:border-[var(--admin-accent)]"
      />
    </label>
  );
}

