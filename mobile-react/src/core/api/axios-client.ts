import {
  create,
  isAxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { ApiError, toApiError } from '@/src/core/api/api-error';
import { ENV } from '@/src/core/config/env';
import { APP_CONFIG } from '@/src/core/constants/app-constants';
import { secureSession } from '@/src/core/storage/secure-storage';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    allowWhenReadOnly?: boolean;
    allowAuthTransitionRefresh?: boolean;
    requestContextSignal?: AbortSignal;
  }
}

type RefreshHandler = () => Promise<string | null>;
type AuthFailureHandler = () => void;
type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshHandler: RefreshHandler | null = null;
let authFailureHandler: AuthFailureHandler | null = null;
let readOnlyGuard: { isReadOnly: () => boolean; onBlocked: () => void } | null = null;
let authenticationTransitionDepth = 0;
let requestContextController = new AbortController();

export function rotateAxiosRequestContext(): void {
  requestContextController.abort();
  requestContextController = new AbortController();
}

export function getAxiosRequestContextSignal(): AbortSignal {
  return requestContextController.signal;
}

export function resolveAxiosRequestContextSignal(expected?: AbortSignal): AbortSignal {
  if (expected && expected !== requestContextController.signal) {
    throw new ApiError(
      0,
      'The authenticated request context changed before this operation could be sent.',
      { type: 'Authentication.RequestContextChanged' },
    );
  }

  return expected ?? requestContextController.signal;
}

export function beginAxiosAuthenticationTransition(): () => void {
  if (authenticationTransitionDepth === 0) {
    rotateAxiosRequestContext();
  }
  authenticationTransitionDepth += 1;
  let completed = false;

  return () => {
    if (completed) return;
    completed = true;
    authenticationTransitionDepth = Math.max(0, authenticationTransitionDepth - 1);
  };
}

export function isAxiosAuthenticationTransitionActive(): boolean {
  return authenticationTransitionDepth > 0;
}

export function hasNewerStoredAccessToken(
  requestAccessToken: string | null,
  currentAccessToken: string | null,
): boolean {
  return Boolean(
    requestAccessToken &&
    currentAccessToken &&
    requestAccessToken !== currentAccessToken,
  );
}

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

  // Bind the request to the current authenticated context before the first
  // asynchronous operation. Otherwise a context rotation while secure storage
  // is being read can let an old request attach to the replacement context.
  config.signal = resolveAxiosRequestContextSignal(config.requestContextSignal);

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

    const requestAccessToken = config
      ? readBearerToken(config.headers.get('Authorization'))
      : null;

    if (
      error.response?.status === 401 &&
      config &&
      !config.skipAuth &&
      !config._retry
    ) {
      const currentAccessToken = await secureSession.getAccessToken();
      if (hasNewerStoredAccessToken(requestAccessToken, currentAccessToken)) {
        config._retry = true;
        config.headers.set('Authorization', `Bearer ${currentAccessToken}`);
        return axiosClient.request(config);
      }
    }

    const runRefresh = refreshHandler;
    const canRefresh =
      error.response?.status === 401 &&
      config &&
      !config.skipAuth &&
      !config.skipAuthRefresh &&
      !config._retry &&
      (authenticationTransitionDepth === 0 || config.allowAuthTransitionRefresh) &&
      runRefresh;

    if (!canRefresh) {
      return Promise.reject(toApiError(error));
    }

    config._retry = true;

    try {
      const accessToken = await runRefresh();
      if (!accessToken) {
        const currentAccessToken = await secureSession.getAccessToken();
        if (hasNewerStoredAccessToken(requestAccessToken, currentAccessToken)) {
          config._retry = true;
          config.headers.set('Authorization', `Bearer ${currentAccessToken}`);
          return axiosClient.request(config);
        }
        if (isAxiosAuthenticationTransitionActive()) {
          return Promise.reject(toApiError(error));
        }
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

export type ApiRequestConfig = AxiosRequestConfig;

function isWriteMethod(method: string | undefined): boolean {
  return ['post', 'put', 'patch', 'delete'].includes(method?.toLowerCase() ?? '');
}

function readBearerToken(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match?.[1]?.trim() || null;
}
