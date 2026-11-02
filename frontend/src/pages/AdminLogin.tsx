"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminLoginPage() {
  const { status, error, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      navigate("/admin", { replace: true });
    }
  }, [status, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("admin_remembered_email");
    if (saved) {
      queueMicrotask(() => {
        setEmail(saved);
        setRememberMe(true);
      });
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    if (rememberMe) {
      localStorage.setItem("admin_remembered_email", email);
    } else {
      localStorage.removeItem("admin_remembered_email");
    }

    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate("/admin", { replace: true });
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="admin-root flex min-h-screen items-center justify-center bg-[var(--admin-bg)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--admin-accent)]" />
      </div>
    );
  }

  return (
    <div className="admin-root flex min-h-screen items-center justify-center bg-[var(--admin-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-[var(--admin-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-accent)]" />
            ADMIN ACCESS
          </div>
          <Link
            to="/"
            className="flex items-center justify-center rounded p-1.5 text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
            title="Return to site"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6"
        >
          <div className="space-y-4">
            <label className="block group">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)] transition-colors group-focus-within:text-[var(--admin-accent)]">
                EMAIL
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--admin-text-muted)] transition-colors group-focus-within:text-[var(--admin-accent)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded border border-[var(--admin-border-strong)] bg-[var(--admin-bg)] py-2 pl-10 pr-3 font-mono text-sm text-[var(--admin-text)] outline-none transition-colors focus:border-[var(--admin-accent)]"
                />
              </div>
            </label>

            <label className="block group">
              <span className="mb-1.5 block font-mono text-[10px] tracking-[0.15em] text-[var(--admin-text-muted)] transition-colors group-focus-within:text-[var(--admin-accent)]">
                PASSWORD
              </span>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--admin-text-muted)] transition-colors group-focus-within:text-[var(--admin-accent)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded border border-[var(--admin-border-strong)] bg-[var(--admin-bg)] py-2 pl-10 pr-10 font-mono text-sm text-[var(--admin-text)] outline-none transition-colors focus:border-[var(--admin-accent)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)] focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="group flex cursor-pointer items-center gap-2 w-max">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded-sm border border-[var(--admin-border-strong)] bg-[var(--admin-bg)] transition-colors group-hover:border-[var(--admin-accent)] peer-checked:border-[var(--admin-accent)] peer-checked:bg-[var(--admin-accent)]" />
                {rememberMe && (
                  <svg
                    className="absolute h-3 w-3 text-[var(--admin-bg)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="font-mono text-[10px] text-[var(--admin-text-muted)] transition-colors group-hover:text-[var(--admin-text)]">
                REMEMBER ME
              </span>
            </label>
          </div>

          {error && (
            <p className="rounded border border-[var(--admin-danger)]/30 bg-[var(--admin-danger)]/10 px-3 py-2 font-mono text-xs text-[var(--admin-danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full rounded bg-[var(--admin-accent)] py-2.5 font-mono text-xs font-semibold tracking-[0.15em] text-[var(--admin-bg)] transition-all duration-200 ease-out hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
          >
            {submitting ? "AUTHENTICATING…" : "SIGN IN"}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] tracking-[0.1em] text-[var(--admin-text-faint)]">
          RATE-LIMITED · ARGON2 · JWT
        </p>
      </div>
    </div>
  );
}

