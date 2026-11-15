"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api/config";

type HealthState = "checking" | "online" | "offline";

export function HealthPanel({ className }: { className?: string }) {
  const [state, setState] = useState<HealthState>("checking");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [database, setDatabase] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${getApiBase()}/health`);
        const data = await res.json();
        if (!cancelled) {
          setState(data.status === "ok" ? "online" : "offline");
          setDatabase(data.database === "connected" ? "connected" : null);
          setLastChecked(data.checked_at ? new Date(data.checked_at) : null);
        }
      } catch {
        if (!cancelled) {
          setState("offline");
          setDatabase(null);
          setLastChecked(null);
        }
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
          <span className="font-mono text-[9px] text-[var(--admin-text-muted)]">
            last check {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2 font-mono text-xs">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-[var(--admin-text)] font-semibold">api: {state === "checking" ? "checking…" : state}</span>
      </div>
      {database && <div className="mt-2 font-mono text-xs text-[var(--admin-text-muted)]">db: {database}</div>}
    </div>
  );
}
