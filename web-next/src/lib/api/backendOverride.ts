export const BACKEND_OVERRIDE_HEADER = "x-backend-url";
export const BACKEND_OVERRIDE_COOKIE = "hrms_backend_override";

const BACKEND_OVERRIDE_STORAGE_KEY = "hrms.backendUrl";
const BACKEND_OVERRIDE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/**
 * Validates and normalizes a backend base URL.
 * Returns the normalized URL (no trailing slashes) or null when invalid.
 */
export function normalizeBackendUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export function getStoredBackendOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizeBackendUrl(window.localStorage.getItem(BACKEND_OVERRIDE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveBackendOverride(value: unknown): string | null {
  const normalized = normalizeBackendUrl(value);
  if (!normalized || typeof window === "undefined") return null;

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
  document.cookie = value
    ? `${BACKEND_OVERRIDE_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${BACKEND_OVERRIDE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
    : `${BACKEND_OVERRIDE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
