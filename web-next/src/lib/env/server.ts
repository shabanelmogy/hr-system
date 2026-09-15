import "server-only";

import type { NextRequest } from "next/server";
import {
  BACKEND_OVERRIDE_COOKIE,
  BACKEND_OVERRIDE_HEADER,
  isBackendOriginAllowed,
  normalizeBackendUrl,
} from "@/lib/api/backendOverride";
import { DEFAULT_MAX_BUFFERED_BODY_BYTES } from "@/lib/api/proxy-transport";

export function getBackendUrl() {
  const value =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("BACKEND_URL is required");
  }

  const normalized = normalizeBackendUrl(value);
  if (!normalized) {
    throw new Error("BACKEND_URL must be an absolute HTTP(S) origin without a path");
  }
  return normalized;
}

export function getBufferedBodyLimit(): number {
  const raw = process.env.BFF_MAX_BUFFERED_BODY_BYTES;
  if (raw === undefined) return DEFAULT_MAX_BUFFERED_BODY_BYTES;
  if (!/^[1-9]\d*$/.test(raw)) {
    throw new Error("BFF_MAX_BUFFERED_BODY_BYTES must be a positive integer");
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error("BFF_MAX_BUFFERED_BODY_BYTES must be a positive integer");
  }
  return value;
}

/**
 * Resolves the backend base URL for a browser-initiated request.
 * Precedence: explicit header, persisted cookie override, then env default.
 */
export function resolveRequestBackendUrl(request: NextRequest): string {
  const defaultOrigin = getBackendUrl();
  if (process.env.BACKEND_OVERRIDE_ENABLED !== "true") return defaultOrigin;

  const configuredOrigins = process.env.BACKEND_ALLOWED_ORIGINS;
  const parsedOrigins = configuredOrigins === undefined || configuredOrigins.trim() === ""
    ? []
    : configuredOrigins.split(/[;,]/).map((origin) => normalizeBackendUrl(origin.trim()));
  if (parsedOrigins.some((origin) => origin === null)) {
    throw new Error("BACKEND_ALLOWED_ORIGINS contains an invalid HTTP(S) origin");
  }
  const allowedOrigins = new Set([
    defaultOrigin,
    ...parsedOrigins.filter((origin): origin is string => origin !== null),
  ]);
  const headerValue = request.headers.get(BACKEND_OVERRIDE_HEADER);
  if (isBackendOriginAllowed(headerValue, [...allowedOrigins])) {
    return normalizeBackendUrl(headerValue) as string;
  }

  const cookieValue = request.cookies.get(BACKEND_OVERRIDE_COOKIE)?.value;
  if (isBackendOriginAllowed(cookieValue, [...allowedOrigins])) {
    return normalizeBackendUrl(cookieValue) as string;
  }

  return defaultOrigin;
}
