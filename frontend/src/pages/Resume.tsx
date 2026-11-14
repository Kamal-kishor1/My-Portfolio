import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResume, getSiteSettings, getResumeDownloadUrl, type ResumeEntry } from "../../lib/api";
import PageMeta from "../PageMeta";
function formatRange(entry: ResumeEntry) { if (!entry.start_date) return null; return `${entry.start_date.slice(0, 7)} → ${entry.end_date ? entry.end_date.slice(0, 7) : "present"}`; }
function Section({ title, entries }: { title: string; entries: ResumeEntry[] }) { if (!entries.length) return null; return <section className="mb-14"><h2 className="mb-6 font-mono text-sm uppercase tracking-widest text-[var(--color-text-muted)]">{title}</h2><div className="space-y-8">{entries.map(entry => <div key={entry.id} className="flex gap-4"><div className="w-12 shrink-0 pt-1 font-mono text-xs text-[var(--color-accent)]">{String(entry.sort_order).padStart(2, "0")}</div><div><h3 className="font-medium">{entry.title}</h3>{entry.organization && <p className="text-sm text-[var(--color-text-muted)]">{entry.organization}</p>}{formatRange(entry) && <p className="mt-1 font-mono text-xs text-[var(--color-amber)]">{formatRange(entry)}</p>}{entry.description && <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{entry.description}</p>}</div></div>)}</div></section>; }
export default function Resume() {
  const [entries, setEntries] = useState<ResumeEntry[]>([]);
  const [resumeAvailable, setResumeAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    getResume().then(setEntries).catch(() => setEntries([]));
    getSiteSettings().then((settings) => setResumeAvailable(settings.resume_available)).catch(() => setResumeAvailable(false));
  }, []);

  return <>
    <PageMeta title="Résumé — Kamal Kishor" description="Experience, education, and technical skills of Kamal Kishor, Software Engineer."/>
    <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="mb-12">
        <p className="mb-2 font-mono text-sm text-[var(--color-status-live)]">Experience · Education · Skills</p>
        <h1 className="mb-6 font-mono text-3xl font-semibold tracking-tight">Résumé</h1>
        <div className="flex min-h-10 flex-wrap items-center gap-3 font-mono text-sm">
          <Link to="/projects" className="rounded-sm bg-[var(--color-accent)] px-4 py-2 font-medium text-[var(--color-bg)] transition-colors hover:opacity-90">Explore my work</Link>
          <Link to="/contact" className="rounded-sm border border-[var(--color-border)] px-4 py-2 transition-colors hover:border-[var(--color-accent)]">Contact me</Link>
          <a
            href={getResumeDownloadUrl()}
            aria-hidden={resumeAvailable !== true}
            tabIndex={resumeAvailable === true ? 0 : -1}
            className={`rounded-sm border border-[var(--color-border)] px-4 py-2 transition-[opacity,border-color] hover:border-[var(--color-accent)] ${resumeAvailable === true ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >Download PDF</a>
        </div>
      </section>
      {entries.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">Résumé details are being updated. Please check back soon.</p> : <><Section title="Experience" entries={entries.filter(e => e.type === "experience")}/><Section title="Education" entries={entries.filter(e => e.type === "education")}/><Section title="Technical Skills" entries={entries.filter(e => e.type === "skill")}/></>}
    </div>
  </>;
}
