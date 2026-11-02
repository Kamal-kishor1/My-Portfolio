"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

type Status = "checking" | "online" | "offline";

export default function StatusBar() {
  const [status, setStatus] = useState<Status>("checking");
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const data = await getHealth();
      if (cancelled) return;
      if (data && data.status === "ok") {
        setStatus("online");
        setDbStatus(data.database ?? null);
      } else {
        setStatus("offline");
        setDbStatus(null);
      }
      setCheckedAt(
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }

    check();
    const interval = setInterval(check, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const dotColor =
    status === "online" ? "bg-[var(--color-status-live)]" : status === "offline" ? "bg-red-500" : "bg-[var(--color-text-muted)]";
  const label =
    status === "online" ? "api: online" : status === "offline" ? "api: offline" : "api: checking\u2026";

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-5xl px-6 py-2 flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor} ${
              status === "online" ? "animate-pulse" : ""
            }`}
            aria-hidden="true"
          />
          <span>{label}</span>
          <span className="text-[var(--color-border)]">/</span>
          <span>db: {dbStatus ?? "unknown"}</span>
        </div>
        {checkedAt && <span>last check {checkedAt}</span>}
      </div>
    </div>
  );
}
