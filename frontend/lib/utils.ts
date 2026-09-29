import axios from "axios";

import { API_URL, ROLE_BASE, ROLE_HOME } from "@/lib/constants";
import type { ApiErrorInfo, UserRole } from "@/types/auth";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const FALLBACK_ERROR = "Something went wrong. Please try again.";

/** Turns any thrown value (axios error, FastAPI validation error...) into a readable message. */
export function parseApiError(error: unknown, fallback: string = FALLBACK_ERROR): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return { message: "Unable to reach the server. Check your connection and try again." };
    }

    const status = error.response.status;
    const detail = error.response.data?.detail;

    if (typeof detail === "string") {
      return { message: detail, status };
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const msg = detail[0]?.msg;
      if (typeof msg === "string") {
        return { message: msg.replace(/^Value error, /, ""), status };
      }
    }

    return { message: fallback, status };
  }

  if (error instanceof Error) {
    return { message: error.message || fallback };
  }
  return { message: fallback };
}

/** Only allows post-login redirects that stay inside the user's own area of the app. */
export function getSafeRedirect(next: string | null, role: UserRole): string {
  const base = ROLE_BASE[role];
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    (next === base || next.startsWith(`${base}/`))
  ) {
    return next;
  }
  return ROLE_HOME[role];
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

/** The API returns event images as a relative path (e.g. "/static/uploads/..."). */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Formats an ISO date for a <input type="datetime-local"> value, in the browser's local time. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Converts a <input type="datetime-local"> value (local time, no offset) to a full ISO string. */
export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function truncate(text: string, maxLength: number): string {
  const clean = text.trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}
