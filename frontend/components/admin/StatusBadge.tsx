type Tone = "positive" | "neutral" | "warning";

const TONE_STYLES: Record<Tone, string> = {
  positive: "border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]",
  neutral: "border-[var(--admin-border-strong)] bg-[var(--admin-bg)] text-[var(--admin-text-muted)]",
  warning: "border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]",
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.05em] ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}
