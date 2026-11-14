import { useEffect, useState, type FormEvent } from "react";
import { getAdminSiteSettings, saveAdminSiteSettings, type AdminSiteSettingsUpdate } from "@/lib/api/siteSettings";
import { listMedia } from "@/lib/api/media";
import type { MediaItem } from "@/types/media";

const DEFAULT_OPEN_TO_WORK_TEXT = "Open to work · Backend / AI-ML Engineer · India (remote OK)";

export function SiteSettingsTab() {
  const [settings, setSettings] = useState<AdminSiteSettingsUpdate>({
    contact_email: "",
    linkedin_url: "",
    github_url: "",
    open_to_work_enabled: true,
    open_to_work_text: DEFAULT_OPEN_TO_WORK_TEXT,
    resume_pdf_media_id: null,
  });
  const [pdfs, setPdfs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAdminSiteSettings(), listMedia()])
      .then(([siteSettings, media]) => {
        if (cancelled) return;
        setSettings({
          contact_email: siteSettings.contact_email ?? "",
          linkedin_url: siteSettings.linkedin_url ?? "",
          github_url: siteSettings.github_url ?? "",
          open_to_work_enabled: siteSettings.open_to_work_enabled,
          open_to_work_text: siteSettings.open_to_work_text || DEFAULT_OPEN_TO_WORK_TEXT,
          resume_pdf_media_id: siteSettings.resume_pdf_media_id,
        });
        setPdfs(media.filter((item) => item.content_type === "application/pdf"));
        setLoaded(true);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load site settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function update<K extends keyof AdminSiteSettingsUpdate>(key: K, value: AdminSiteSettingsUpdate[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload: AdminSiteSettingsUpdate = {
        ...settings,
        contact_email: settings.contact_email?.trim() || null,
        linkedin_url: settings.linkedin_url?.trim() || null,
        github_url: settings.github_url?.trim() || null,
      };
      const saved = await saveAdminSiteSettings(payload);
      setSettings({
        contact_email: saved.contact_email ?? "",
        linkedin_url: saved.linkedin_url ?? "",
        github_url: saved.github_url ?? "",
        open_to_work_enabled: saved.open_to_work_enabled,
        open_to_work_text: saved.open_to_work_text,
        resume_pdf_media_id: saved.resume_pdf_media_id,
      });
      setNotice("Site settings saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save site settings.");
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 font-mono text-xs text-[var(--admin-text)] outline-none focus:border-[var(--admin-accent)]";

  return (
    <section className="max-w-3xl">
      <div className="mb-5">
        <h1 className="font-mono text-sm tracking-[0.15em] text-[var(--admin-text)]">SITE SETTINGS</h1>
        <p className="mt-2 font-mono text-xs text-[var(--admin-text-muted)]">Public contact links, availability badge, and résumé file.</p>
      </div>
      {error && <p className="mb-4 rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]" role="alert">{error}</p>}
      {notice && <p className="mb-4 font-mono text-xs text-[var(--admin-accent)]" aria-live="polite">{notice}</p>}
      {loading ? <p className="font-mono text-xs text-[var(--admin-text-muted)]">Loading settings…</p> : !loaded ? (
        <p className="font-mono text-xs text-[var(--admin-text-muted)]">Settings could not be loaded. Reload this tab before editing.</p>
      ) : (
        <form onSubmit={save} className="space-y-6 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="font-mono text-xs text-[var(--admin-text-muted)]">Public contact email
              <input className={fieldClass} type="email" maxLength={320} value={settings.contact_email ?? ""} onChange={(event) => update("contact_email", event.target.value)} />
            </label>
            <label className="font-mono text-xs text-[var(--admin-text-muted)]">LinkedIn URL
              <input className={fieldClass} type="url" value={settings.linkedin_url ?? ""} onChange={(event) => update("linkedin_url", event.target.value)} />
            </label>
            <label className="font-mono text-xs text-[var(--admin-text-muted)]">GitHub URL
              <input className={fieldClass} type="url" value={settings.github_url ?? ""} onChange={(event) => update("github_url", event.target.value)} />
            </label>
          </div>

          <fieldset className="space-y-3 border-t border-[var(--admin-border)] pt-5">
            <legend className="font-mono text-xs tracking-wider text-[var(--admin-text)]">OPEN TO WORK</legend>
            <label className="flex items-center gap-2 font-mono text-xs text-[var(--admin-text-muted)]">
              <input type="checkbox" checked={settings.open_to_work_enabled} onChange={(event) => update("open_to_work_enabled", event.target.checked)} />
              Show badge on the home page
            </label>
            <label className="block font-mono text-xs text-[var(--admin-text-muted)]">Badge text
              <input className={fieldClass} type="text" required maxLength={200} value={settings.open_to_work_text} onChange={(event) => update("open_to_work_text", event.target.value)} />
            </label>
          </fieldset>

          <fieldset className="space-y-2 border-t border-[var(--admin-border)] pt-5">
            <legend className="font-mono text-xs tracking-wider text-[var(--admin-text)]">RÉSUMÉ PDF</legend>
            <label className="block font-mono text-xs text-[var(--admin-text-muted)]" htmlFor="resume-pdf">Select an uploaded PDF
              <select id="resume-pdf" className={fieldClass} value={settings.resume_pdf_media_id ?? ""} onChange={(event) => update("resume_pdf_media_id", event.target.value ? Number(event.target.value) : null)}>
                <option value="">No résumé PDF selected</option>
                {pdfs.map((file) => <option key={file.id} value={file.id}>{file.filename}</option>)}
              </select>
            </label>
            <p className="font-mono text-[10px] text-[var(--admin-text-muted)]">Upload Kamal_Kishor_Resume.pdf in Media first. The public download remains a private, signed attachment.</p>
          </fieldset>

          <div className="flex items-center justify-end border-t border-[var(--admin-border)] pt-4">
            <button type="submit" disabled={saving} className="rounded bg-[var(--admin-accent)] px-4 py-2 font-mono text-xs font-semibold text-[var(--admin-bg)] disabled:opacity-50">{saving ? "SAVING…" : "SAVE SETTINGS"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
