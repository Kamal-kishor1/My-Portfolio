import { useEffect, useState } from "react";
import { getResume, type ResumeEntry } from "../../lib/api";
import PageMeta from "../PageMeta";

function getSkills(entries: ResumeEntry[]) {
  return entries
    .filter(
      (entry) =>
        entry.type === "skill" &&
        entry.title !== "Certifications & Training" &&
        entry.title !== "Leadership & Activities"
    )
    .sort((a, b) => a.sort_order - b.sort_order);
}

export default function Skills() {
  const [entries, setEntries] = useState<ResumeEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getResume()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoaded(true));
  }, []);

  const skills = getSkills(entries);

  return (
    <>
      <PageMeta
        title="Skills — Kamal Kishor"
        description="Technical skills across backend engineering, frontend development, AI and machine learning, and embedded systems."
      />
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--color-status-live)]">
          Technical skills <span className="text-[var(--color-text-muted)]">// Tools &amp; practice</span>
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Skills</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-[var(--color-text-muted)]">
          A practical toolkit shaped by building web applications, machine learning projects, computer vision systems, and connected devices.
        </p>

        {skills.length > 0 ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {skills.map((entry, index) => {
              const items = (entry.description ?? "")
                .split("·")
                .map((item) => item.trim())
                .filter(Boolean);
              return (
                <section
                  key={entry.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none sm:p-7"
                >
                  <h2 className="border-b border-[var(--color-border)] pb-4 font-mono text-sm font-semibold leading-relaxed">
                    <span className="mr-3 text-[var(--color-status-live)]">{String(index + 1).padStart(2, "0")} //</span>
                    {entry.title}
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label={entry.title}>
                    {items.map((item) => (
                      <li
                        key={item}
                        className="cursor-default rounded border border-[var(--color-border)] px-3 py-1.5 font-mono text-xs text-[var(--color-text-muted)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)] motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="mt-12 rounded-lg border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)]">
            {loaded ? "Skills are being updated." : "Loading skills…"}
          </p>
        )}
      </div>
    </>
  );
}
