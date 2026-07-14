import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  LEGACY_ACCESS_TOKEN_COOKIE,
  LEGACY_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "./constants";

export type AuthPayload = {
  token: string;
  tokenExpiration?: string;
  refreshToken: string;
  refreshTokenExpiration?: string;
  [key: string]: unknown;
};

export type AuthCookieSource = {
  get(name: string): { value: string } | undefined;
};

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
  migrationPayload?: AuthPayload;
};

export function readAuthTokens(source: AuthCookieSource): AuthTokens {
  const currentAccessToken = source.get(ACCESS_TOKEN_COOKIE)?.value || undefined;
  const legacyAccessToken = source.get(LEGACY_ACCESS_TOKEN_COOKIE)?.value || undefined;
  const currentRefreshToken = source.get(REFRESH_TOKEN_COOKIE)?.value || undefined;
  const legacyRefreshToken = source.get(LEGACY_REFRESH_TOKEN_COOKIE)?.value || undefined;
  const accessToken = currentAccessToken ?? legacyAccessToken;
  const refreshToken = currentRefreshToken ?? legacyRefreshToken;
  const usesLegacyCookie =
    (!currentAccessToken && Boolean(legacyAccessToken)) ||
    (!currentRefreshToken && Boolean(legacyRefreshToken));

  return {
    accessToken,
    refreshToken,
    migrationPayload:
      usesLegacyCookie && accessToken && refreshToken
        ? { token: accessToken, refreshToken }
        : undefined,
  };
}

const cookieOptions = (expires?: string) => ({
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  ...(validDate(expires) ? { expires: new Date(expires!) } : {}),
});

const validDate = (value?: string): boolean => {
  if (!value || typeof value !== "string") return false;
  
  const date = new Date(value);
  const timestamp = date.getTime();
  
  // Must be a valid date and in the future
  if (Number.isNaN(timestamp)) return false;
  if (timestamp < Date.now()) return false;
  
  // Reject dates more than 1 year in the future (likely invalid)
  const oneYearFromNow = Date.now() + 365 * 24 * 60 * 60 * 1000;
  if (timestamp > oneYearFromNow) return false;
  
  return true;
};

export function isAuthPayload(value: unknown): value is AuthPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AuthPayload>;
  return (
    typeof candidate.token === "string" &&
    candidate.token.trim().length > 0 &&
    typeof candidate.refreshToken === "string" &&
    candidate.refreshToken.trim().length > 0 &&
    (candidate.tokenExpiration === undefined || validDate(candidate.tokenExpiration)) &&
    (candidate.refreshTokenExpiration === undefined || validDate(candidate.refreshTokenExpiration))
  );
}

export function setAuthCookies(response: NextResponse, payload: AuthPayload) {
  // Keep the access token cookie alive as long as the refresh token, 
  // so the server can access the expired token for refresh requests.
  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.token, cookieOptions(payload.refreshTokenExpiration));
  response.cookies.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, cookieOptions(payload.refreshTokenExpiration));
  clearCookie(response, LEGACY_ACCESS_TOKEN_COOKIE);
  clearCookie(response, LEGACY_REFRESH_TOKEN_COOKIE);
  
  // Ensure no-store is always present, even if other middleware sets cache-control
  const existingCC = response.headers.get("cache-control");
  if (!existingCC || !existingCC.includes("no-store")) {
    response.headers.set("cache-control", "no-store, no-cache, must-revalidate, private");
  }
}

export function clearAuthCookies(response: NextResponse) {
  clearCookie(response, ACCESS_TOKEN_COOKIE);
  clearCookie(response, REFRESH_TOKEN_COOKIE);
  clearCookie(response, LEGACY_ACCESS_TOKEN_COOKIE);
  clearCookie(response, LEGACY_REFRESH_TOKEN_COOKIE);
  
  // Ensure no-store is always present
  const existingCC = response.headers.get("cache-control");
  if (!existingCC || !existingCC.includes("no-store")) {
    response.headers.set("cache-control", "no-store, no-cache, must-revalidate, private");
  }
}

/**
 * Removes sensitive token fields from auth payload for safe logging.
 * ⚠️ WARNING: This does NOT sanitize the original payload object.
 * Always call this BEFORE logging, never log the raw payload.
 * 
 * @example
 * // ❌ WRONG - tokens already logged
 * console.log("Raw:", payload);
 * const safe = sanitizeAuthPayload(payload);
 * 
 * // ✅ CORRECT - only sanitized data logged
 * const safe = sanitizeAuthPayload(payload);
 * console.log("Safe:", safe);
 */
export function sanitizeAuthPayload(payload: AuthPayload) {
  const user: Record<string, unknown> = {};
  
  // Copy only non-sensitive fields
  for (const [key, value] of Object.entries(payload)) {
    if (key !== 'token' && key !== 'refreshToken' && 
        key !== 'tokenExpiration' && key !== 'refreshTokenExpiration') {
      user[key] = value;
    }
  }
  
  return { ...user, isAuthenticated: true };
}

function clearCookie(response: NextResponse, name: string) {
  // Clear with current secure options
  response.cookies.set(name, "", { ...cookieOptions(), maxAge: 0 });
  
  // For legacy cookies, also try clearing with insecure options
  // (in case they were set before __Host- migration)
  if (name === LEGACY_ACCESS_TOKEN_COOKIE || name === LEGACY_REFRESH_TOKEN_COOKIE) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    });
  }
}
