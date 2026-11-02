import { useEffect, useMemo, useState } from "react";
import type { MediaItem } from "@/types/media";
import { looksLikeImage } from "@/types/media";
import type { SeoMeta } from "@/types/seoMeta";
import { listMedia, uploadMedia } from "@/lib/api/media";
import { createSeoMeta, listSeoMeta, updateSeoMeta } from "@/lib/api/seoMeta";

export function HomepagePhotoTab() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [siteMeta, setSiteMeta] = useState<SeoMeta | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const [mediaItems, metaEntries] = await Promise.all([listMedia(), listSeoMeta()]);
    const site = metaEntries.find((entry) => entry.entity_type === "site" && entry.entity_id === null) ?? null;
    setMedia(mediaItems.filter(looksLikeImage));
    setSiteMeta(site);
    setSelectedId(site?.og_image_id ? String(site.og_image_id) : "");
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMedia(), listSeoMeta()])
      .then(([mediaItems, metaEntries]) => {
        if (cancelled) return;
        const site = metaEntries.find((entry) => entry.entity_type === "site" && entry.entity_id === null) ?? null;
        setMedia(mediaItems.filter(looksLikeImage));
        setSiteMeta(site);
        setSelectedId(site?.og_image_id ? String(site.og_image_id) : "");
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load homepage photo settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(() => media.find((item) => String(item.id) === selectedId) ?? null, [media, selectedId]);

  async function savePhoto(mediaId: number | null) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const input = { og_image_id: mediaId };
      if (siteMeta) {
        await updateSeoMeta(siteMeta.id, input);
      } else {
        const created = await createSeoMeta({ entity_type: "site", entity_id: null, title: null, description: null, ...input });
        setSiteMeta(created);
      }
      await refresh();
      setNotice(mediaId ? "Homepage photo saved." : "Homepage photo removed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save homepage photo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const uploaded = await uploadMedia(file, altText);
      setMedia((current) => [uploaded, ...current.filter((item) => item.id !== uploaded.id)]);
      setSelectedId(String(uploaded.id));
      const input = { og_image_id: uploaded.id };
      if (siteMeta) {
        await updateSeoMeta(siteMeta.id, input);
      } else {
        const created = await createSeoMeta({ entity_type: "site", entity_id: null, title: null, description: null, ...input });
        setSiteMeta(created);
      }
      setFile(null);
      setAltText("");
      setNotice("Photo uploaded and set as the homepage portrait.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not upload homepage photo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">HOMEPAGE PHOTO</h1>
        <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-[var(--admin-text-muted)]">
          Upload a portrait to Neon Object Storage or choose an existing image. The selected photo appears beside your homepage introduction.
        </p>
      </div>

      {error && <p role="alert" className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded border border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-accent)]">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <form onSubmit={handleUpload} className="space-y-4 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <h2 className="font-mono text-xs tracking-[0.12em] text-[var(--admin-text)]">UPLOAD A NEW PORTRAIT</h2>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.12em] text-[var(--admin-text-muted)]">IMAGE FILE · MAX 10 MB</span>
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full font-mono text-xs text-[var(--admin-text)]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.12em] text-[var(--admin-text-muted)]">ACCESSIBLE DESCRIPTION</span>
              <input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={500} placeholder="Portrait of Kamal Kishor" className="w-full rounded border border-[var(--admin-border-strong)] bg-[var(--admin-bg)] px-3 py-2 font-mono text-xs text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]" />
            </label>
            <button disabled={!file || saving} className="rounded bg-[var(--admin-accent)] px-4 py-2 font-mono text-xs font-semibold text-[var(--admin-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
              {saving ? "SAVING…" : "UPLOAD & SET AS HOMEPAGE PHOTO"}
            </button>
          </form>

          <div className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
            <h2 className="mb-4 font-mono text-xs tracking-[0.12em] text-[var(--admin-text)]">OR CHOOSE FROM MEDIA</h2>
            {loading ? <p className="font-mono text-xs text-[var(--admin-text-muted)]">Loading images…</p> : media.length === 0 ? (
              <p className="font-mono text-xs text-[var(--admin-text-muted)]">No images available yet. Upload a portrait above or add one in Media.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item) => (
                  <button key={item.id} type="button" onClick={() => setSelectedId(String(item.id))} aria-pressed={selectedId === String(item.id)} className={`overflow-hidden rounded border text-left transition-colors ${selectedId === String(item.id) ? "border-[var(--admin-accent)] ring-1 ring-[var(--admin-accent)]" : "border-[var(--admin-border)] hover:border-[var(--admin-border-strong)]"}`}>
                    <img src={item.url} alt={item.alt_text ?? ""} className="aspect-square w-full bg-[var(--admin-bg)] object-cover" />
                    <span className="block truncate px-2 py-1.5 font-mono text-[10px] text-[var(--admin-text-muted)]">{item.filename}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" disabled={!selected || saving} onClick={() => selected && savePhoto(selected.id)} className="rounded bg-[var(--admin-accent)] px-4 py-2 font-mono text-xs font-semibold text-[var(--admin-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{saving ? "SAVING…" : "SAVE SELECTION"}</button>
              {siteMeta?.og_image_id && <button type="button" disabled={saving} onClick={() => savePhoto(null)} className="rounded border border-[var(--admin-border-strong)] px-4 py-2 font-mono text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] disabled:opacity-40">REMOVE HOMEPAGE PHOTO</button>}
            </div>
          </div>
        </div>

        <aside className="rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
          <p className="mb-3 font-mono text-[10px] tracking-[0.12em] text-[var(--admin-text-muted)]">HOMEPAGE PREVIEW</p>
          <div className="aspect-[4/5] overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)]">
            {selected ? <img src={selected.url} alt={selected.alt_text ?? "Selected homepage portrait"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_50%_35%,rgba(72,132,255,0.18),transparent_65%)] font-mono text-5xl font-semibold text-[var(--admin-accent)]/50">KK</div>}
          </div>
          <p className="mt-3 break-words font-mono text-[10px] text-[var(--admin-text-muted)]">{selected?.alt_text || selected?.filename || "No photo selected"}</p>
        </aside>
      </div>
    </section>
  );
}
