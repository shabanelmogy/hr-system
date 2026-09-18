import { NextRequest } from "next/server";
import { normalizeClientTelemetryEvent } from "@/lib/observability/clientTelemetryContract";
import { recordClientTelemetryEvent } from "@/lib/observability/serverTelemetry";

const MAX_CLIENT_TELEMETRY_BODY_BYTES = 2_048;

export async function POST(request: NextRequest): Promise<Response> {
  if (process.env.WEB_OTEL_ENABLED !== "true") {
    return noContent();
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return new Response(null, { status: 415 });
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CLIENT_TELEMETRY_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (new TextEncoder().encode(body).byteLength > MAX_CLIENT_TELEMETRY_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  let rawEvent: unknown;
  try {
    rawEvent = JSON.parse(body) as unknown;
  } catch {
    return new Response(null, { status: 400 });
  }

  const event = normalizeClientTelemetryEvent(rawEvent);
  if (!event) return new Response(null, { status: 400 });

  recordClientTelemetryEvent(event);
  return noContent();
}

function noContent(): Response {
  return new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store" },
  });
}
