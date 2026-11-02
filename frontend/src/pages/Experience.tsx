import { useEffect, useState } from "react";
import { getResume, type ResumeEntry } from "../../lib/api";
import PageMeta from "../PageMeta";

function formatMonth(value: string): string {
  const [year, month] = value.slice(0, 7).split("-").map(Number);
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(year, month - 1));
}

function formatRange(entry: ResumeEntry): string {
  const start = entry.start_date ? formatMonth(entry.start_date) : "";
  const end = entry.end_date ? formatMonth(entry.end_date) : "Present";
  return start ? `${start} – ${end}` : end;
}

export default function Experience() {
  const [entries, setEntries] = useState<ResumeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getResume()
      .then((resume) => setEntries(resume.filter((entry) => entry.type === "experience").sort((a, b) => b.sort_order - a.sort_order)))
      .catch(() => setEntries([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <>
      <PageMeta
        title="Experience — Kamal Kishor"
        description="Professional experience in software engineering, backend development, and application delivery."
      />
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-status-live)]">
          Industry practice <span className="text-[var(--color-text-muted)]">// Professional experience</span>
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Experience</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-muted)]">
          Teams, responsibilities, and the engineering work I have contributed to along the way.
        </p>

        <div className="relative mt-12 space-y-6 before:absolute before:bottom-8 before:left-[11px] before:top-8 before:w-px before:bg-[var(--color-border)]">
          {entries.map((entry) => {
            const highlights = (entry.description ?? "")
              .split(/;\s*/)
              .map((item) => item.trim().replace(/[.]$/, ""))
              .filter(Boolean);
            return (
              <article key={entry.id} className="relative pl-10">
                <span className="absolute left-1.5 top-7 h-3 w-3 rounded-full border-2 border-[var(--color-status-live)] bg-[var(--color-bg)]" aria-hidden="true" />
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
                  <div className="flex flex-col justify-between gap-3 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="font-serif text-xl font-semibold sm:text-2xl">{entry.title}</h2>
                      {entry.organization && <p className="mt-1 text-[var(--color-status-live)]">{entry.organization}</p>}
                    </div>
                    <span className="w-fit rounded border border-[var(--color-border)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-muted)]">
                      {formatRange(entry)}
                    </span>
                  </div>
                  {highlights.length > 0 && (
                    <ul className="mt-5 space-y-3">
                      {highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                          <span className="mt-0.5 text-[var(--color-status-live)]" aria-hidden="true">✦</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
          {entries.length === 0 && (
            <p className="ml-10 rounded-lg border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)]">
              {loaded ? "Experience details are being updated." : "Loading experience…"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
