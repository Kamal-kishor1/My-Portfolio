"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api/config";

type HealthState = "checking" | "online" | "offline";

export function HealthPanel({ className }: { className?: string }) {
  const [state, setState] = useState<HealthState>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${getApiBase()}/health`);
        if (!cancelled) setState(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setState("offline");
      } finally {
        if (!cancelled) setLastChecked(new Date());
      }
    }

    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const dotColor =
    state === "online" ? "bg-[var(--admin-accent)]" : state === "offline" ? "bg-[var(--admin-danger)]" : "animate-pulse bg-[var(--admin-text-muted)]";

  return (
    <div className={`rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[var(--admin-text)]">SYSTEM HEALTH</h2>
        {lastChecked && (
          <span className="font-mono text-[9px] text-zinc-400">
            last check {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 font-mono text-xs">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-[var(--admin-text)] font-semibold">api: {state === "checking" ? "checking…" : state}</span>
      </div>
      {/* GET /health currently returns only {"status": "ok"} — no separate DB
          check — so we don't fabricate a "db: connected" line here. If the
          backend adds DB-connectivity reporting to /health, surface it here. */}
      <p className="mt-auto pt-4 font-mono text-[10px] leading-relaxed text-zinc-400">
        Reflects API reachability only. Your backend&apos;s /health endpoint
        doesn&apos;t currently report database connectivity separately, so no
        DB status is shown.
      </p>
    </div>
  );
}
