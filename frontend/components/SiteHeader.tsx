import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSiteSettings } from "../lib/api";
import { ThemeToggle } from "./ThemeToggle";

const DEFAULT_GITHUB_URL = "https://github.com/Kamal-kishor1";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "Résumé" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [githubUrl, setGithubUrl] = useState<string | null>(DEFAULT_GITHUB_URL);

  useEffect(() => {
    getSiteSettings()
      .then((settings) => setGithubUrl(settings.github_url))
      .catch(() => undefined);
  }, []);

  return (
    <header className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
        <Link to="/" className="font-mono font-semibold tracking-tight text-lg">
          Kamal Kishor
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-[var(--color-text-muted)] sm:gap-5 sm:text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              title="GitHub profile"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.304 3.493.997.108-.775.418-1.305.762-1.605-2.665-.3-5.467-1.333-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 6.007 0c2.292-1.552 3.298-1.23 3.298-1.23.655 1.653.243 2.874.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .32.216.694.825.576C20.565 21.795 24 17.297 24 12 24 5.37 18.63 0 12 0Z" />
              </svg>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
