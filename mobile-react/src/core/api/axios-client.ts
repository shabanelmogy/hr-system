import {
  AxiosError,
  create,
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { ApiError, type ApiProblemDetails } from '@/src/core/api/api-error';
import { ENV } from '@/src/core/config/env';
import { APP_CONFIG } from '@/src/core/constants/app-constants';
import { secureSession } from '@/src/core/storage/secure-storage';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    allowWhenReadOnly?: boolean;
  }
}

type RefreshHandler = () => Promise<string | null>;
type AuthFailureHandler = () => void;
type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshHandler: RefreshHandler | null = null;
let authFailureHandler: AuthFailureHandler | null = null;
let readOnlyGuard: { isReadOnly: () => boolean; onBlocked: () => void } | null = null;

export function configureAxiosAuthentication(options: {
  refresh: RefreshHandler;
  onAuthFailure: AuthFailureHandler;
}): () => void {
  refreshHandler = options.refresh;
  authFailureHandler = options.onAuthFailure;

  return () => {
    refreshHandler = null;
    authFailureHandler = null;
  };
}

export function configureAxiosReadOnlyAccess(guard: {
  isReadOnly: () => boolean;
  onBlocked: () => void;
}): () => void {
  readOnlyGuard = guard;

  return () => {
    if (readOnlyGuard === guard) readOnlyGuard = null;
  };
}

export const axiosClient = create({
  baseURL: ENV.apiUrl || undefined,
  timeout: APP_CONFIG.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
  },
});

axiosClient.interceptors.request.use(async (config) => {
  if (!ENV.isApiConfigured) {
    throw new ApiError(0, 'EXPO_PUBLIC_API_URL is not configured.');
  }

  if (!config.skipAuth) {
    const accessToken = await secureSession.getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  if (
    isWriteMethod(config.method) &&
    !config.allowWhenReadOnly &&
    readOnlyGuard?.isReadOnly()
  ) {
    readOnlyGuard.onBlocked();
    throw new ApiError(
      423,
      'This tenant is in read-only mode because its subscription has expired.',
      { type: 'Tenant.SubscriptionReadOnly' },
    );
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableRequestConfig | undefined;
    if (error.response?.status === 423) {
      readOnlyGuard?.onBlocked();
    }
    const runRefresh = refreshHandler;
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      !config.skipAuth &&
      !config.skipAuthRefresh &&
      !config._retry &&
      runRefresh;

    if (!canRefresh) {
      return Promise.reject(toApiError(error));
    }

    config._retry = true;

    try {
      const accessToken = await runRefresh();
      if (!accessToken) {
        authFailureHandler?.();
        return Promise.reject(toApiError(error));
      }

      config.headers.set('Authorization', `Bearer ${accessToken}`);
      return axiosClient.request(config);
    } catch (refreshError) {
      return Promise.reject(toApiError(refreshError));
    }
  },
);

function isProblemDetails(value: unknown): value is ApiProblemDetails {
  return value !== null && typeof value === 'object';
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError || isAxiosError(error)) {
    const problem = isProblemDetails(error.response?.data) ? error.response.data : undefined;
    const status = error.response?.status ?? 0;
    const fallbackMessage =
      error.code === AxiosError.ETIMEDOUT || error.code === AxiosError.ECONNABORTED
        ? 'The request timed out.'
        : error.message || 'Unable to reach the server.';

    return new ApiError(
      status,
      problem?.detail ?? problem?.title ?? fallbackMessage,
      problem,
    );
  }

  return new ApiError(0, error instanceof Error ? error.message : 'An unexpected error occurred.');
}

export type ApiRequestConfig = AxiosRequestConfig;

function isWriteMethod(method: string | undefined): boolean {
  return ['post', 'put', 'patch', 'delete'].includes(method?.toLowerCase() ?? '');
}
