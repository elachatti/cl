import { api } from "@/services/api";
import type {
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  RegisterResponse,
  TokenResponse,
  User,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await api.post<TokenResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>("/auth/register", payload);
    return data;
  },

  async logout(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/logout");
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/verify-email", { token });
    return data;
  },

  async resendVerification(email: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/resend-verification", { email });
    return data;
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string,
  ): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/reset-password", {
      token,
      password,
      confirm_password: confirmPassword,
    });
    return data;
  },
};
