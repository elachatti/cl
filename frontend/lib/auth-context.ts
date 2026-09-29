import { createContext } from "react";

import type { LoginPayload, RegisterPayload, RegisterResponse, User } from "@/types/auth";

export interface AuthContextValue {
  user: User | null;
  /** True until the stored session has been checked against the API. */
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
