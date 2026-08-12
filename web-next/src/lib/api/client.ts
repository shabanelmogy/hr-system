"use client";

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type Method } from "axios";
import i18n from "i18next";
import {
  SESSION_CHANGED_EVENT,
  SESSION_REFRESHED_HEADER,
} from "@/lib/auth/constants";

export type ApiError = {
  status: number;
  title: string;
  message: string;
  detail?: string;
  traceId?: string;
  type?: string;
  errorCodes?: string[];
  fieldErrors: Record<string, string[]> | null;
  errors: string[] | null;
};

type ReadOnlyGuard = {
  isReadOnly: () => boolean;
  onBlocked: () => void;
};

type AppRequestConfig = AxiosRequestConfig & {
  allowWhenReadOnly?: boolean;
};

class ApiClient {
  private readonly api: AxiosInstance;
  private navigatingToLogin = false;
  private readOnlyGuard: ReadOnlyGuard | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: "",
      withCredentials: true,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" }
    });

    this.api.interceptors.request.use((config) => {
      config.headers.Culture = i18n.language || "en";

      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        config.headers.delete("Content-Type");
      }

      return config;
    });

    this.api.interceptors.response.use(
      (response) => {
        notifySessionRefresh(response.headers[SESSION_REFRESHED_HEADER]);
        return response;
      },
      async (error: AxiosError) => {
        notifySessionRefresh(
          error.response?.headers[SESSION_REFRESHED_HEADER],
        );
        const url = error.config?.url ?? "";
        if (error.response?.status === 423) {
          this.readOnlyGuard?.onBlocked();
        }
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
        fieldErrors: null,
        errors: null
      };
    }

    const data = error.response.data as
      | {
          title?: string;
          detail?: string;
          traceId?: string;
          type?: string;
          errors?: Record<string, unknown[]> | unknown[];
        }
      | undefined;
    const errors = normalizeApiErrors(data?.errors);
    const fieldErrors = normalizeFieldErrors(data?.errors);
    return {
      status: error.response.status,
      title: data?.title ?? "Error",
      detail: data?.detail,
      traceId: data?.traceId,
      type: data?.type,
      errorCodes:
        data?.errors && !Array.isArray(data.errors)
          ? Object.keys(data.errors)
          : undefined,
      fieldErrors,
      errors,
      message:
        data?.detail ??
        errors?.[0] ??
        data?.title ??
        `Request failed with status ${error.response.status}`
    };
  }

  configureReadOnlyGuard(guard: ReadOnlyGuard) {
    this.readOnlyGuard = guard;

    return () => {
      if (this.readOnlyGuard === guard) this.readOnlyGuard = null;
    };
  }

  private async request<T = any>(method: Method, endpoint: string, config: AppRequestConfig = {}) {
    if (
      isWriteMethod(method) &&
      !config.allowWhenReadOnly &&
      this.readOnlyGuard?.isReadOnly()
    ) {
      this.readOnlyGuard.onBlocked();
      throw createReadOnlyError();
    }

    const axiosConfig = { ...config };
    delete axiosConfig.allowWhenReadOnly;
    try {
      const response = await this.api.request<T>({ method, url: endpoint, ...axiosConfig });
      return response.data;
    } catch (error) {
      throw this.processError(error);
    }
  }

  get<T = any>(endpoint: string, params: Record<string, unknown> = {}) {
    return this.request<T>("GET", endpoint, { params });
  }

  post<T = any>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("POST", endpoint, { data, headers: getDataHeaders(data, headers) });
  }

  postBlob(endpoint: string, data: unknown, contentType: string) {
    return this.request<Blob>("POST", endpoint, {
      data,
      responseType: "blob",
      headers: { Accept: contentType },
      allowWhenReadOnly: true,
    });
  }

  put<T = any>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("PUT", endpoint, { data, headers: getDataHeaders(data, headers) });
  }

  patch<T = any>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("PATCH", endpoint, { data, headers: getDataHeaders(data, headers) });
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

function isWriteMethod(method: Method) {
  return ["post", "put", "patch", "delete"].includes(method.toLowerCase());
}

function createReadOnlyError(): ApiError {
  return {
    status: 423,
    title: i18n.t("tenantAccess.title"),
    message: i18n.t("tenantAccess.readOnlyExplanation"),
    detail: i18n.t("tenantAccess.description"),
    type: "Tenant.SubscriptionReadOnly",
    fieldErrors: null,
    errors: null,
  };
}

function getDataHeaders(data: unknown, headers: Record<string, string>) {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    const multipartHeaders = { ...headers };
    delete multipartHeaders["Content-Type"];
    delete multipartHeaders["content-type"];
    return multipartHeaders;
  }

  return headers;
}

function notifySessionRefresh(value: unknown) {
  if (value === "1" && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
  }
}

export const apiClient = new ApiClient();
export default apiClient;

function isPublicAuthenticationRequest(url: string) {
  return [
    "/auth/login",
    "/auth/selectCompany",
    "/auth/register",
    "/auth/forgetPassword",
    "/auth/resetPassword",
    "/auth/confirmEmail",
    "/auth/resendConfirmationEmail",
    "/account/google-auth",
  ].some((path) => url.toLowerCase().includes(path.toLowerCase()));
}

function normalizeApiErrors(
  errors: Record<string, unknown[]> | unknown[] | undefined,
): string[] | null {
  if (!errors) return null;

  const values = Array.isArray(errors) ? errors : Object.values(errors).flat();
  const messages = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  return messages.length > 0 ? messages : null;
}

function normalizeFieldErrors(
  errors: Record<string, unknown[]> | unknown[] | undefined,
): Record<string, string[]> | null {
  if (!errors || Array.isArray(errors)) return null;

  const normalized = Object.fromEntries(
    Object.entries(errors)
      .map(([field, value]) => [
        field,
        (Array.isArray(value) ? value : [value])
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean),
      ])
      .filter(([, messages]) => messages.length > 0),
  );

  return Object.keys(normalized).length > 0 ? normalized : null;
}
