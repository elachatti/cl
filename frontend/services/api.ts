import axios from "axios";

import { API_URL } from "@/lib/constants";
import { clearSession, getToken } from "@/lib/token-storage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== "undefined") {
      const url = error.config?.url ?? "";
      const isCredentialCheck = url.startsWith("/auth/login");
      const onPublicPage = /^\/(login|register|forgot-password|reset-password|verify-email)/.test(
        window.location.pathname,
      );

      // A 401 on any other request means the stored token is no longer valid.
      if (!isCredentialCheck && getToken()) {
        clearSession();
        if (!onPublicPage) {
          window.location.assign("/login?session=expired");
        }
      }
    }
    return Promise.reject(error);
  },
);
