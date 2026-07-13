"use client";

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type Method } from "axios";
import i18n from "i18next";

export type ApiError = {
  status: number;
  title: string;
  message: string;
  errors: unknown[] | null;
};

class ApiClient {
  private readonly api: AxiosInstance;
  private navigatingToLogin = false;

  constructor() {
    this.api = axios.create({
      baseURL: "",
      withCredentials: true,
      headers: { "Content-Type": "application/json" }
    });

    this.api.interceptors.request.use((config) => {
      config.headers.Culture = i18n.language || "en";
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const url = error.config?.url ?? "";
        if (
          error.response?.status === 401 &&
          !isPublicAuthenticationRequest(url) &&
          typeof window !== "undefined"
        ) {
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  private processError(error: unknown): ApiError {
    if (!axios.isAxiosError(error) || !error.response) {
      return {
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
        errors: null
      };
    }

    const data = error.response.data as { title?: string; errors?: Record<string, unknown[]> } | undefined;
    return {
      status: error.response.status,
      title: data?.title ?? "Error",
      errors: data?.errors ? Object.values(data.errors).flat() : null,
      message: data?.title ?? `Request failed with status ${error.response.status}`
    };
  }

  private async request<T = any>(method: Method, endpoint: string, config: AxiosRequestConfig = {}) {
    try {
      const response = await this.api.request<T>({ method, url: endpoint, ...config });
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  get<T = any>(endpoint: string, params: Record<string, unknown> = {}) {
    return this.request<T>("GET", endpoint, { params });
  }

  post<T = any>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("POST", endpoint, { data, headers });
  }

  put<T = any>(endpoint: string, data?: unknown) {
    return this.request<T>("PUT", endpoint, { data });
  }

  patch<T = any>(endpoint: string, data?: unknown) {
    return this.request<T>("PATCH", endpoint, { data });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>("DELETE", endpoint);
  }

  async logout() {
    if (this.navigatingToLogin) return;
    this.navigatingToLogin = true;

    if (typeof window !== "undefined") {
      // Dispatch event — SessionProvider listener handles cookie deletion + router.replace
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
  }

  /** Reset the guard — called by the logout handler after navigation completes. */
  resetLogoutGuard() {
    this.navigatingToLogin = false;
  }

  setNavigateFunction() {
    // Navigation is owned by Next.js; retained temporarily for callers during module migration.
  }

  externalAuth<T = any>(endpoint: string, data: unknown) {
    return this.post<T>(endpoint, data);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

function isPublicAuthenticationRequest(url: string) {
  return [
    "/auth/login",
    "/auth/register",
    "/auth/forgetPassword",
    "/auth/resetPassword",
    "/auth/confirmEmail",
    "/auth/resendConfirmationEmail",
    "/account/google-auth",
  ].some((path) => url.toLowerCase().includes(path.toLowerCase()));
}
