"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/lib/auth-context";
import {
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
  updateStoredUser,
} from "@/lib/token-storage";
import { authService } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload, User } from "@/types/auth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session on first load and confirm it is still valid with the API.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      const cached = getStoredUser();
      if (cached) setUser(cached);

      try {
        const freshUser = await authService.me();
        if (cancelled) return;
        setUser(freshUser);
        updateStoredUser(freshUser);
      } catch (error) {
        if (cancelled) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
          setUser(null);
        }
        // Network errors keep the cached user so the UI still works offline-ish.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    saveSession(data.access_token, data.user, payload.remember_me, data.expires_in);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback((payload: RegisterPayload) => authService.register(payload), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* the token is discarded locally either way */
    }
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
