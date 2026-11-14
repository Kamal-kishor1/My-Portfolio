import { useEffect, useState } from 'react';
import ContactForm from '../../components/ContactForm';
import { getResumeDownloadUrl, getSiteSettings, type PublicSiteSettings } from '../../lib/api';
import PageMeta from '../PageMeta';

export default function Contact() {
  const [settings, setSettings] = useState<PublicSiteSettings | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  async function copyEmail() {
    if (!settings?.contact_email) return;
    try {
      await navigator.clipboard.writeText(settings.contact_email);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
    }
  }

  return <>
    <PageMeta title="Contact — Kamal Kishor" description="Contact Kamal Kishor about backend and AI/ML engineering roles, projects, or questions." />
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-2 font-mono text-sm text-[var(--color-status-live)]">Let&apos;s connect</p>
      <h1 className="mb-4 font-mono text-3xl font-semibold">Contact</h1>
      <p className="mb-10 max-w-2xl leading-relaxed text-[var(--color-text-muted)]">I&apos;m looking for backend and AI/ML engineering roles. If you have a role, a project or a question, send me a message and I&apos;ll reply within 2 days.</p>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <ContactForm />
        <aside className="h-fit rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-4 font-mono text-sm font-semibold">Direct links</h2>
          <div className="space-y-4 text-sm">
            {settings?.contact_email && <div>
              <p className="mb-1 font-mono text-xs text-[var(--color-text-muted)]">Email</p>
              <div className="flex flex-wrap items-center gap-2">
                <a className="break-all text-[var(--color-accent)] hover:underline" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                <button type="button" onClick={copyEmail} className="rounded-sm border border-[var(--color-border)] px-2 py-1 font-mono text-xs hover:border-[var(--color-accent)]">{copyState === 'copied' ? 'Copied' : 'Copy email'}</button>
              </div>
              {copyState === 'error' && <p className="mt-1 font-mono text-xs text-red-500" aria-live="polite">Could not copy. Select the email address to copy it.</p>}
            </div>}
            {settings?.linkedin_url && <a className="block text-[var(--color-accent)] hover:underline" href={settings.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>}
            {settings?.github_url && <a className="block text-[var(--color-accent)] hover:underline" href={settings.github_url} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>}
            {settings?.resume_available && <a className="inline-flex rounded-sm border border-[var(--color-border)] px-3 py-2 font-mono text-xs hover:border-[var(--color-accent)]" href={getResumeDownloadUrl()}>Download PDF</a>}
            {!settings && <p className="text-xs text-[var(--color-text-muted)]">Direct links are temporarily unavailable.</p>}
          </div>
        </aside>
      </div>
    </div>
  </>;
}
