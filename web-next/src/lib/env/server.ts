import "server-only";

import type { NextRequest } from "next/server";
import {
  BACKEND_OVERRIDE_COOKIE,
  BACKEND_OVERRIDE_HEADER,
  normalizeBackendUrl,
} from "@/lib/api/backendOverride";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export function getBackendUrl() {
  const value =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("BACKEND_URL is required");
  }

  return trimTrailingSlash(value);
}

/**
 * Resolves the backend base URL for a browser-initiated request.
 * Precedence: explicit header, persisted cookie override, then env default.
 */
export function resolveRequestBackendUrl(request: NextRequest): string {
  const headerValue = normalizeBackendUrl(request.headers.get(BACKEND_OVERRIDE_HEADER));
  if (headerValue) return headerValue;

  const cookieValue = normalizeBackendUrl(request.cookies.get(BACKEND_OVERRIDE_COOKIE)?.value);
  if (cookieValue) return cookieValue;

  return getBackendUrl();
}
