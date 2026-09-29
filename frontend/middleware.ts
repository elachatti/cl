import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, ROLE_HOME, USER_ROLES } from "@/lib/constants";
import type { UserRole } from "@/types/auth";

interface TokenPayload {
  role?: string;
  exp?: number;
}

/** Reads the JWT payload. The signature is verified by the API, not here. */
function decodePayload(token: string): TokenPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as TokenPayload;
  } catch {
    return null;
  }
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as string[]).includes(value);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const rawToken = request.cookies.get(AUTH_COOKIE)?.value;
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;
  const payload = token ? decodePayload(token) : null;

  const role = payload?.role;
  const isSessionValid =
    !!payload &&
    typeof payload.exp === "number" &&
    payload.exp * 1000 > Date.now() &&
    isUserRole(role);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Allow users to freely access login and register pages at any time.
  if (isAuthPage) {
    return NextResponse.next();
  }

  // Legacy dashboard routes redirect to the unified Clubi feed.
  return NextResponse.redirect(new URL("/feed", request.url));
}

export const config = {
  matcher: ["/student/:path*", "/club/:path*", "/admin/:path*", "/login", "/register"],
};
