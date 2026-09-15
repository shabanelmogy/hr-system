"use client";

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type GenericAbortSignal, type Method } from "axios";
import i18n from "i18next";
import {
  BACKEND_OVERRIDE_HEADER,
  getStoredBackendOverride,
} from "@/lib/api/backendOverride";
import {
  publicBackendAllowedOrigins,
  publicBackendOverrideEnabled,
  publicDefaultBackendOrigin,
} from "@/config/publicEnv";
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
  code?: string;
  errorCodes?: string[];
  fieldErrors: Record<string, string[]> | null;
  errors: string[] | null;
};

export class ApiClientError extends Error implements ApiError {
  status: number;
  title: string;
  detail?: string;
  traceId?: string;
  type?: string;
  code?: string;
  errorCodes?: string[];
  fieldErrors: Record<string, string[]> | null;
  errors: string[] | null;

  constructor(apiError: ApiError) {
    super(apiError.message || apiError.title || "An unexpected error occurred");
    this.name = "ApiClientError";
    this.status = apiError.status;
    this.title = apiError.title;
    this.detail = apiError.detail;
    this.traceId = apiError.traceId;
    this.type = apiError.type;
    this.code = apiError.code;
    this.errorCodes = apiError.errorCodes;
    this.fieldErrors = apiError.fieldErrors;
    this.errors = apiError.errors;
  }
}

export type ApiErrorPayload = {
  title?: unknown;
  detail?: unknown;
  traceId?: unknown;
  type?: unknown;
  code?: unknown;
  codes?: unknown;
  errors?: unknown;
};

export function parseApiErrorPayload(payload: unknown, status: number): ApiError {
  const data = isRecord(payload) ? payload as ApiErrorPayload : {};
  const errors = normalizeApiErrors(data.errors as Record<string, unknown[]> | unknown[] | undefined);
  const fieldErrors = normalizeFieldErrors(data.errors as Record<string, unknown[]> | unknown[] | undefined);
  const title = asString(data.title) ?? "Error";
  const detail = asString(data.detail);
  return {
    status,
    title,
    detail,
    traceId: asString(data.traceId),
    type: asString(data.type),
    code: asString(data.code),
    errorCodes: normalizeErrorCodes(data.codes),
    fieldErrors,
    errors,
    message: detail ?? errors?.[0] ?? title ?? `Request failed with status ${status}`,
  };
}

type ReadOnlyGuard = {
  isReadOnly: () => boolean;
  onBlocked: () => void;
};

type AppRequestConfig = AxiosRequestConfig & {
  allowWhenReadOnly?: boolean;
  allowDuringContextTransition?: boolean;
};

class ApiClient {
  private readonly api: AxiosInstance;
  private navigatingToLogin = false;
  private readOnlyGuard: ReadOnlyGuard | null = null;
  private requestContextController = new AbortController();
  private contextTransitionGate: Promise<void> | null = null;
  private resolveContextTransition: (() => void) | null = null;
  private contextTransitionDepth = 0;

  constructor() {
    this.api = axios.create({
      baseURL: "",
      withCredentials: true,
      timeout: 30_000,
      headers: { "Content-Type": "application/json" }
    });

    this.api.interceptors.request.use((config) => {
      config.headers.Culture = i18n.language || "en";

      const allowedOrigins = [
        ...publicBackendAllowedOrigins,
        ...(publicDefaultBackendOrigin ? [publicDefaultBackendOrigin] : []),
      ];
      const backendOverride = publicBackendOverrideEnabled
        ? getStoredBackendOverride(allowedOrigins)
        : null;
      if (backendOverride) {
        config.headers.set(BACKEND_OVERRIDE_HEADER, backendOverride);
      }

      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        config.headers.delete("Content-Type");
      }

      return config;
    });

    this.api.interceptors.response.use(
      (response) => {
        if (response.config.signal?.aborted) throw new axios.CanceledError("Work context changed");
        notifySessionRefresh(response.headers[SESSION_REFRESHED_HEADER]);
        return response;
      },
      async (error: AxiosError) => {
        if (error.config?.signal?.aborted) return Promise.reject(new axios.CanceledError("Work context changed"));
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
          // Revalidate before logging out. A request carrying the previous
          // company token can complete after a successful company switch.
          window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
        }
        return Promise.reject(error);
      }
    );
  }

  private processError(error: unknown): ApiClientError {
    if (!axios.isAxiosError(error) || !error.response) {
      return new ApiClientError({
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
        fieldErrors: null,
        errors: null,
      });
    }

    return new ApiClientError(parseApiErrorPayload(error.response.data, error.response.status));
  }

  configureReadOnlyGuard(guard: ReadOnlyGuard) {
    this.readOnlyGuard = guard;

    return () => {
      if (this.readOnlyGuard === guard) this.readOnlyGuard = null;
    };
  }

  /** Abort requests that belong to the previous tenant/company work context. */
  rotateRequestContext() {
    this.requestContextController.abort("work-context-changed");
    this.requestContextController = new AbortController();
  }

  /** Pause new API work until the server session reflects the new company. */
  beginContextTransition() {
    this.contextTransitionDepth += 1;
    if (this.contextTransitionDepth !== 1) return;
    this.contextTransitionGate = new Promise<void>((resolve) => {
      this.resolveContextTransition = resolve;
    });
  }

  endContextTransition() {
    if (this.contextTransitionDepth === 0) return;
    this.contextTransitionDepth -= 1;
    if (this.contextTransitionDepth > 0) return;
    this.resolveContextTransition?.();
    this.resolveContextTransition = null;
    this.contextTransitionGate = null;
  }

  private async request<T = unknown>(method: Method, endpoint: string, config: AppRequestConfig = {}) {
    if (this.contextTransitionGate && !config.allowDuringContextTransition) {
      // Never replay work created by the previous screen using new cookies.
      throw new axios.CanceledError("Work context is changing");
    }
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
    delete axiosConfig.allowDuringContextTransition;
    axiosConfig.signal = mergeAbortSignals(
      axiosConfig.signal,
      this.requestContextController.signal,
    );
    try {
      const response = await this.api.request<T>({ method, url: endpoint, ...axiosConfig });
      if (axiosConfig.signal.aborted) throw new axios.CanceledError("Work context changed");
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw this.processError(error);
    }
  }

  get<T = unknown>(endpoint: string, params: Record<string, unknown> = {}) {
    return this.request<T>("GET", endpoint, { params });
  }

  getBlob(endpoint: string) {
    return this.request<Blob>("GET", endpoint, {
      responseType: "blob",
      headers: { Accept: "application/octet-stream" },
      allowWhenReadOnly: true,
    });
  }

  async getBlobDownload(endpoint: string): Promise<{ blob: Blob; fileName: string | null }> {
    if (this.contextTransitionGate) {
      throw new axios.CanceledError("Work context is changing");
    }

    const signal = mergeAbortSignals(undefined, this.requestContextController.signal);
    try {
      const response = await this.api.request<Blob>({
        method: "GET",
        url: endpoint,
        responseType: "blob",
        headers: { Accept: "application/octet-stream" },
        signal,
      });
      if (signal?.aborted) throw new axios.CanceledError("Work context changed");
      return {
        blob: response.data,
        fileName: parseContentDispositionFileName(response.headers["content-disposition"]),
      };
    } catch (error) {
      if (axios.isCancel(error)) throw error;
      throw this.processError(error);
    }
  }

  post<T = unknown>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("POST", endpoint, { data, headers: getDataHeaders(data, headers) });
  }

  postBlob(endpoint: string, data: unknown, contentType: string, timeout = 30_000) {
    return this.request<Blob>("POST", endpoint, {
      data,
      responseType: "blob",
      headers: { Accept: contentType },
      timeout,
      allowWhenReadOnly: true,
    });
  }

  put<T = unknown>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("PUT", endpoint, { data, headers: getDataHeaders(data, headers) });
  }

  patch<T = unknown>(endpoint: string, data?: unknown, headers: Record<string, string> = {}) {
    return this.request<T>("PATCH", endpoint, { data, headers: getDataHeaders(data, headers) });
  }

  delete<T = unknown>(endpoint: string, data?: unknown) {
    return this.request<T>("DELETE", endpoint, { data });
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

  externalAuth<T = unknown>(endpoint: string, data: unknown) {
    return this.post<T>(endpoint, data);
  }
}

function mergeAbortSignals(
  callerSignal: GenericAbortSignal | undefined,
  contextSignal: AbortSignal,
): GenericAbortSignal {
  if (!callerSignal) return contextSignal;
  if (callerSignal === contextSignal) return contextSignal;
  // Axios types the standard signal structurally as GenericAbortSignal. Runtime
  // callers pass AbortSignal instances, so the cast only restores DOM members
  // that Axios intentionally omits from its public config type.
  return AbortSignal.any([callerSignal as AbortSignal, contextSignal]);
}

function isWriteMethod(method: Method) {
  return ["post", "put", "patch", "delete"].includes(method.toLowerCase());
}

function createReadOnlyError(): ApiClientError {
  return new ApiClientError({
    status: 423,
    title: i18n.t("tenantAccess.title"),
    message: i18n.t("tenantAccess.readOnlyExplanation"),
    detail: i18n.t("tenantAccess.description"),
    type: "Tenant.SubscriptionReadOnly",
    fieldErrors: null,
    errors: null,
  });
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
    "/auth/selectTenant",
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
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

function normalizeErrorCodes(value: unknown): string[] | undefined {
  if (typeof value === "string" && value.trim()) return [value];
  if (!Array.isArray(value)) return undefined;
  const codes = value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  return codes.length > 0 ? codes : undefined;
}

function parseContentDispositionFileName(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(value)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded).trim() || null;
    } catch {
      return encoded.trim() || null;
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(value)?.[1];
  if (quoted?.trim()) return quoted.trim();
  const plain = /filename=([^;]+)/i.exec(value)?.[1];
  return plain?.trim() || null;
}
