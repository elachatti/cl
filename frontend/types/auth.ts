export type UserRole = "student" | "club" | "admin";
export type RegisterRole = Exclude<UserRole, "admin">;

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: RegisterRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: UserRole;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface ApiErrorInfo {
  message: string;
  status?: number;
}
