"use client";

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)]">
        <div className="flex items-center gap-3 font-mono text-sm text-[var(--admin-text-muted)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--admin-accent)]" />
          <span>VERIFYING SESSION…</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
