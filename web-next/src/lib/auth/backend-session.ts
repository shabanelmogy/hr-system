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
  | { status: "unauthenticated" }
  | { status: "unavailable" };

const refreshRequests = new Map<string, Promise<RefreshResult>>();
const completedRefreshGraceMs = 10_000;

export async function resolveSession(
  accessToken?: string,
  refreshToken?: string,
): Promise<ResolvedSession> {
  console.log(`${TAG} 🔍 Resolving session...`);
  if (!accessToken) {
    console.log(`${TAG} ❌ No access token, unauthenticated`);
    return { status: "unauthenticated" };
  }

  const currentSession = await fetchVerifiedSession(accessToken);

  if (currentSession.status === "authenticated") {
    console.log(`${TAG} ✅ Access token valid, authenticated`);
    return currentSession;
  }
  if (currentSession.status === "unavailable") {
    console.log(`${TAG} ⚠️ Session verification unavailable`);
    return currentSession;
  }
  if (!refreshToken) {
    console.log(`${TAG} ❌ No refresh token available`);
    return { status: "unauthenticated" };
  }

  console.log(`${TAG} Access token invalid, attempting refresh…`);
  const refreshResult = await refreshAuthTokens(accessToken, refreshToken);
  console.log(`${TAG} Refresh result: ${refreshResult.status}`);

  if (refreshResult.status === "unavailable") return { status: "unavailable" };
  if (refreshResult.status === "rejected") return { status: "unauthenticated" };

  console.log(`${TAG} Tokens refreshed successfully`);
  const refreshedSession = await fetchVerifiedSession(refreshResult.payload.token);
  if (refreshedSession.status !== "authenticated") return refreshedSession;

  return {
    ...refreshedSession,
    authPayload: refreshResult.payload,
  };
}

export function refreshAuthTokens(
  accessToken: string,
  refreshToken: string,
): Promise<RefreshResult> {
  const key = createHash("sha256").update(refreshToken).digest("hex").slice(0, 12);
  const existingRequest = refreshRequests.get(key);
  if (existingRequest) {
    console.log(`${TAG} ♻️ Reusing in-flight refresh request (key: ${key})`);
    return existingRequest;
  }

  console.log(`${TAG} Starting token refresh (key: ${key})`);
  const request = requestTokenRefresh(accessToken, refreshToken);
  
  // Set cache immediately to avoid race condition
  refreshRequests.set(key, request);
  
  // Clean up cache after grace period (always delete to prevent memory leak)
  request.finally(() => {
    const timer = setTimeout(() => {
      if (refreshRequests.get(key) === request) {
        console.log(`${TAG} 🗑️ Refresh grace period expired, clearing cache (key: ${key})`);
        refreshRequests.delete(key);
      }
    }, completedRefreshGraceMs);
    timer.unref?.();
  });

  return request;
}

async function fetchVerifiedSession(accessToken: string): Promise<SessionLookup> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/auth/session`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (response.status === 404) {
      return fetchValidatedClaimsFromCheckAuth(accessToken);
    }
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
  } catch (err) {
    return { status: "unavailable" };
  }
}

async function fetchValidatedClaimsFromCheckAuth(accessToken: string): Promise<SessionLookup> {
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/auth/checkAuth/CheckAuth`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return { status: "unauthenticated" };
    }
    if (!response.ok) return { status: "unavailable" };

    const session = decodeApiValidatedClaims(accessToken);
    return session
      ? { status: "authenticated", session }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

// Safety buffer to prevent using tokens that are about to expire
const TOKEN_EXPIRY_BUFFER_MS = 5000; // 5 seconds

function decodeApiValidatedClaims(token: string): SessionClaims | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const payload = JSON.parse(
      Buffer.from(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as Record<string, unknown>;

    const nameIdentifier = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
    const name = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
    const email = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
    const role = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const expiresAt = typeof payload.exp === "number" ? payload.exp * 1000 : 0;

    const session: SessionClaims = {
      userId: asString(payload[nameIdentifier] ?? payload.sub),
      userName: asString(payload[name] ?? payload.name),
      email: asString(payload[email] ?? payload.email),
      firstName: asString(payload.firstname ?? payload.firstName),
      lastName: asString(payload.lastname ?? payload.lastName),
      roles: asStringArray(payload[role] ?? payload.roles ?? payload.role),
      permissions: asStringArray(payload.Permissions ?? payload.permissions),
      expiresAt,
    };

    // Add buffer to prevent accepting tokens that are about to expire
    return isSessionClaims(session) && session.userId && expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER_MS
      ? session
      : null;
  } catch {
    return null;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value !== "string") return [];

  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return [];
    }
  }

  return [value];
}

function sanitizeForLog(value: string): string {
  return value.replace(/[\n\r\t]/g, '');
}

async function requestTokenRefresh(
  accessToken: string,
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    console.log(`${TAG} 🔄 Calling backend refresh endpoint…`);
    const response = await fetch(`${getBackendUrl()}/api/v1/auth/refreshToken`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: accessToken, refreshToken }),
      cache: "no-store",
    });

    console.log(`${TAG} 🔄 Refresh response: ${response.status} ${sanitizeForLog(response.statusText)}`);

    if (response.status >= 500) {
      console.warn(`${TAG} ❌ Refresh unavailable: server error ${response.status}`);
      return { status: "unavailable" };
    }
    if (!response.ok) {
      console.warn(`${TAG} ❌ Refresh rejected: ${response.status}`);
      return { status: "rejected" };
    }

    const payload: unknown = await response.json();
    if (isAuthPayload(payload)) {
      console.log(`${TAG} Refresh successful`);
      return { status: "refreshed", payload };
    }

    console.warn(`${TAG} ❌ Refresh response is not a valid auth payload`);
    return { status: "unavailable" };
  } catch (err) {
    console.error(`${TAG} ❌ Refresh fetch error:`, err);
    return { status: "unavailable" };
  }
}
