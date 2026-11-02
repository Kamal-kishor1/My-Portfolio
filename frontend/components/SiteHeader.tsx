import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/resume", label: "Résumé" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
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
        </nav>
      </div>
    </header>
  );
}
