import type { NextRequest } from "next/server";

const untrustedForwardingHeaders = new Set([
  "cf-connecting-ip",
  "forwarded",
  "true-client-ip",
  "x-client-ip",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
]);

export function isCrossSiteMutation(request: NextRequest): boolean {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return false;

  if (request.headers.get("sec-fetch-site") === "cross-site") return true;

  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== request.nextUrl.origin);
}

export function hasUnsafeBackendPath(path: readonly string[]): boolean {
  return path.some(isUnsafeBackendPathSegment);
}

export function isUnsafeBackendPathSegment(segment: string): boolean {
  if (!segment || segment === "." || segment === "..") return true;
  if (/[\\/?#\u0000-\u001F\u007F]/.test(segment)) return true;

  try {
    const decoded = decodeURIComponent(segment);
    return decoded !== segment && isUnsafeBackendPathSegment(decoded);
  } catch {
    return true;
  }
}

export function isUntrustedForwardingHeader(name: string): boolean {
  return untrustedForwardingHeaders.has(name.toLowerCase());
}
