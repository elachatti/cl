import { AUTH_COOKIE, TOKEN_KEY, USER_KEY } from "@/lib/constants";
import type { User } from "@/types/auth";

const isBrowser = (): boolean => typeof window !== "undefined";

function writeCookie(token: string, remember: boolean, expiresInSeconds: number): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = remember ? `; Max-Age=${expiresInSeconds}` : "";
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${maxAge}${secure}`;
}

function removeCookie(): void {
  document.cookie = `${AUTH_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
}

/**
 * Persists the session. "Remember me" keeps it in localStorage (survives browser restarts);
 * otherwise it lives in sessionStorage and a session cookie (cleared when the browser closes).
 * The cookie only lets the Next.js middleware guard routes; the API is always the real authority.
 */
export function saveSession(
  token: string,
  user: User,
  remember: boolean,
  expiresInSeconds: number,
): void {
  if (!isBrowser()) return;
  clearSession();

  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  writeCookie(token, remember, expiresInSeconds);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(USER_KEY) ?? window.sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function updateStoredUser(user: User): void {
  if (!isBrowser()) return;
  const storage = window.localStorage.getItem(TOKEN_KEY)
    ? window.localStorage
    : window.sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  removeCookie();
}
