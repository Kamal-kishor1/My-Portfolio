"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_PREFIX } from "@/lib/api/config";
import { apiFetch, refreshAccessToken, setAuthExpiredHandler } from "@/lib/api/client";
import { setAccessToken } from "@/lib/api/token-store";

export interface AdminUser {
  id: number;
  email: string;
  role: "admin" | "editor";
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AdminUser | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // On mount: try to silently restore a session from the httpOnly refresh
  // cookie. This is what makes a page reload not boot the user to /login.
  useEffect(() => {
    setAuthExpiredHandler(clearSession);

    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      const res = await apiFetch(`${API_PREFIX}/admin/auth/me`);
      if (!res.ok) {
        clearSession();
        return;
      }
      const me: AdminUser = await res.json();
      setUser(me);
      setStatus("authenticated");
    })();

    return () => setAuthExpiredHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await apiFetch(`${API_PREFIX}/admin/auth/login`, {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 429) {
        setError("Too many attempts. Try again in a few minutes.");
        return false;
      }
      if (!res.ok) {
        setError("Invalid email or password.");
        return false;
      }

      const data = await res.json();
      setAccessToken(data.access_token);

      const meRes = await apiFetch(`${API_PREFIX}/admin/auth/me`);
      if (!meRes.ok) {
        clearSession();
        setError("Login succeeded but session could not be established.");
        return false;
      }
      const me: AdminUser = await meRes.json();
      setUser(me);
      setStatus("authenticated");
      return true;
    } catch {
      setError("Could not reach the server. Check your connection.");
      return false;
    }
  }, [clearSession]);

  const logout = useCallback(async () => {
    try {
      await apiFetch(`${API_PREFIX}/admin/auth/logout`, { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ status, user, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
