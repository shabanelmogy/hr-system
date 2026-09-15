import "server-only";

import { createHash } from "node:crypto";
import { getBackendUrl } from "@/lib/env/server";
import { isAuthPayload, type AuthPayload } from "./cookies";
import { isSessionClaims, type SessionClaims } from "./session";

const TAG = "[🔐 Session]";

type SessionLookup =
  | { status: "authenticated"; session: SessionClaims }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export type RefreshResult =
  | { status: "refreshed"; payload: AuthPayload }
  | { status: "rejected" }
  | { status: "unavailable" };

export type ResolvedSession =
  | { status: "authenticated"; session: SessionClaims; authPayload?: AuthPayload }
  | { status: "unauthenticated"; authPayload?: never }
  | { status: "unavailable"; authPayload?: AuthPayload };

const refreshRequests = new Map<string, Promise<RefreshResult>>();
const completedRefreshGraceMs = 10_000;
const sessionValidationTimeoutMs = 15_000;
const tokenRefreshTimeoutMs = 15_000;
const definitiveRefreshRejectionStatuses = new Set([400, 401, 403]);

export async function resolveSession(
  accessToken?: string,
  refreshToken?: string,
  backendUrl: string = getBackendUrl(),
): Promise<ResolvedSession> {
  if (!accessToken) {
    return { status: "unauthenticated" };
  }

  const currentSession = await fetchVerifiedSession(accessToken, backendUrl);

  if (currentSession.status === "authenticated") {
    return currentSession;
  }
  if (currentSession.status === "unavailable") {
    return currentSession;
  }
  if (!refreshToken) {
    return { status: "unauthenticated" };
  }

  const refreshResult = await refreshAuthTokens(accessToken, refreshToken, backendUrl);

  if (refreshResult.status === "unavailable") return { status: "unavailable" };
  if (refreshResult.status === "rejected") return { status: "unauthenticated" };

  const refreshedSession = await fetchVerifiedSession(refreshResult.payload.token, backendUrl);
  if (refreshedSession.status === "unavailable") {
    return {
      status: "unavailable",
      authPayload: refreshResult.payload,
    };
  }
  if (refreshedSession.status === "unauthenticated") return refreshedSession;

  return {
    ...refreshedSession,
    authPayload: refreshResult.payload,
  };
}

export function refreshAuthTokens(
  accessToken: string,
  refreshToken: string,
  backendUrl: string = getBackendUrl(),
): Promise<RefreshResult> {
  const key = createHash("sha256").update(refreshToken).digest("hex").slice(0, 12);
  const existingRequest = refreshRequests.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const request = requestTokenRefresh(accessToken, refreshToken, backendUrl);
  
  // Set cache immediately to avoid race condition
  refreshRequests.set(key, request);
  
  // Clean up cache after grace period (always delete to prevent memory leak)
  request.finally(() => {
    const timer = setTimeout(() => {
      if (refreshRequests.get(key) === request) {
        refreshRequests.delete(key);
      }
    }, completedRefreshGraceMs);
    timer.unref?.();
  });

  return request;
}

async function fetchVerifiedSession(
  accessToken: string,
  backendUrl: string,
): Promise<SessionLookup> {
  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/session`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(sessionValidationTimeoutMs),
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated" };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }

    const payload: unknown = await response.json();
    const valid = isSessionClaims(payload);
    return valid
      ? { status: "authenticated", session: payload }
      : { status: "unavailable" };
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn(`${TAG} Session validation timed out after ${sessionValidationTimeoutMs}ms`);
      return { status: "unavailable" };
    }
    return { status: "unavailable" };
  }
}

async function requestTokenRefresh(
  accessToken: string,
  refreshToken: string,
  backendUrl: string,
): Promise<RefreshResult> {
  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/refreshToken`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: accessToken, refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(tokenRefreshTimeoutMs),
    });

    if (definitiveRefreshRejectionStatuses.has(response.status)) {
      console.warn(`${TAG} ❌ Refresh rejected: ${response.status}`);
      return { status: "rejected" };
    }
    if (!response.ok) {
      console.warn(`${TAG} ❌ Refresh temporarily unavailable: ${response.status}`);
      return { status: "unavailable" };
    }

    const payload: unknown = await response.json();
    if (isAuthPayload(payload)) {
      return { status: "refreshed", payload };
    }

    console.warn(`${TAG} ❌ Refresh response is not a valid auth payload`);
    return { status: "unavailable" };
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn(`${TAG} Refresh request timed out after ${tokenRefreshTimeoutMs}ms`);
      return { status: "unavailable" };
    }

    console.warn(`${TAG} Refresh request failed; authentication service unavailable`);
    return { status: "unavailable" };
  }
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}
