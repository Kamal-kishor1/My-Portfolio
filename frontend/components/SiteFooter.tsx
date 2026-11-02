export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24">
      <div className="mx-auto max-w-5xl px-6 py-8 flex items-center justify-between font-mono text-xs text-[var(--color-text-muted)]">
        <span>&copy; {new Date().getFullYear()} Kamal Kishor</span>
        <span>React · FastAPI · Neon PostgreSQL · Neon Object Storage</span>
      </div>
    </footer>
  );
}

