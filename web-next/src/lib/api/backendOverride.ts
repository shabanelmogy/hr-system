export const BACKEND_OVERRIDE_HEADER = "x-backend-url";
export const BACKEND_OVERRIDE_COOKIE = "hrms_backend_override";

const BACKEND_OVERRIDE_STORAGE_KEY = "hrms.backendUrl";
const BACKEND_OVERRIDE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function parseBackendOrigins(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[;,]/)
    .map((item) => normalizeBackendUrl(item))
    .filter((item): item is string => item !== null);
}

export function isBackendOriginAllowed(value: unknown, allowedOrigins: readonly string[]): boolean {
  const normalized = normalizeBackendUrl(value);
  return normalized !== null && allowedOrigins.includes(normalized);
}

/**
 * Validates and normalizes a backend base URL.
 * Returns the normalized URL (no trailing slashes) or null when invalid.
 */
export function normalizeBackendUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getStoredBackendOverride(allowedOrigins: readonly string[]): string | null {
  if (typeof window === "undefined") return null;
  try {
    const normalized = normalizeBackendUrl(window.localStorage.getItem(BACKEND_OVERRIDE_STORAGE_KEY));
    if (!normalized || (allowedOrigins && !allowedOrigins.includes(normalized))) return null;
    return normalized;
  } catch {
    return null;
  }
}

export function saveBackendOverride(value: unknown, allowedOrigins: readonly string[]): string | null {
  const normalized = normalizeBackendUrl(value);
  if (!normalized || (allowedOrigins && !allowedOrigins.includes(normalized)) || typeof window === "undefined") return null;

  try {
    window.localStorage.setItem(BACKEND_OVERRIDE_STORAGE_KEY, normalized);
  } catch {
    // Storage may be unavailable (private mode); the cookie still carries it.
  }
  writeOverrideCookie(normalized);
  return normalized;
}

export function clearBackendOverride(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BACKEND_OVERRIDE_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
  writeOverrideCookie("");
}

function writeOverrideCookie(value: string) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location?.protocol === "https:" ? "; Secure" : "";
  document.cookie = value
    ? `${BACKEND_OVERRIDE_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${BACKEND_OVERRIDE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
    : `${BACKEND_OVERRIDE_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}
