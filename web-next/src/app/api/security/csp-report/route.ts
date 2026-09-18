import { NextRequest } from "next/server";
import { isCrossSiteMutation } from "@/lib/api/proxy-security";
import { normalizeCspViolationReports } from "@/lib/security/cspReport";

const MAX_CSP_REPORT_BODY_BYTES = 16_384;
const CSP_REPORT_CONTENT_TYPES = [
  "application/csp-report",
  "application/reports+json",
  "application/json",
] as const;

export async function POST(request: NextRequest): Promise<Response> {
  if (isCrossSiteMutation(request)) {
    return new Response(null, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!CSP_REPORT_CONTENT_TYPES.some((type) => contentType.startsWith(type))) {
    return new Response(null, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CSP_REPORT_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (new TextEncoder().encode(body).byteLength > MAX_CSP_REPORT_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let rawReport: unknown;
  try {
    rawReport = JSON.parse(body) as unknown;
  } catch {
    return new Response(null, { status: 400 });
  }

  const violations = normalizeCspViolationReports(rawReport);
  if (violations.length === 0) {
    return new Response(null, { status: 400 });
  }

  for (const violation of violations.slice(0, 20)) {
    console.warn("[browser-security] CSP violation", violation);
  }

  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
