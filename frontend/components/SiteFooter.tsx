import { useEffect, useState } from "react";
import { getResumeDownloadUrl, getSiteSettings } from "../lib/api";

export default function SiteFooter() {
  const [resumeAvailable, setResumeAvailable] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then((settings) => setResumeAvailable(settings.resume_available))
      .catch(() => setResumeAvailable(false));
  }, []);

  return (
    <footer className="border-t border-[var(--color-border)] mt-24">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-xs text-[var(--color-text-muted)]">
        <span>&copy; {new Date().getFullYear()} Kamal Kishor</span>
        <span>React · FastAPI · Neon PostgreSQL · Neon Object Storage</span>
        {resumeAvailable && (
          <a className="text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]" href={getResumeDownloadUrl()}>
            Download PDF
          </a>
        )}
      </div>
    </footer>
  );
}

