import type { UserRole } from "@/types/auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export const TOKEN_KEY = "act_token";
export const USER_KEY = "act_user";
export const AUTH_COOKIE = "act_token";
export const THEME_KEY = "theme";

export const ROLE_HOME: Record<UserRole, string> = {
  student: "/feed",
  club: "/feed",
  admin: "/feed",
};

export const ROLE_BASE: Record<UserRole, string> = {
  student: "/student",
  club: "/club",
  admin: "/admin",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  student: "Student",
  club: "Club",
  admin: "Admin",
};

export const USER_ROLES: UserRole[] = ["student", "club", "admin"];
