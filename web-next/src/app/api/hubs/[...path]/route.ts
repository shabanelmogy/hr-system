import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  hasUnsafeBackendPath,
  isCrossSiteMutation,
} from "@/lib/api/proxy-security";
import { resolveRequestBackendUrl } from "@/lib/env/server";
import {
  applyCorrelationHeader,
  createCorrelationId,
} from "@/lib/observability/correlation";
import {
  annotateActiveBffRequest,
  recordBffResponse,
  traceBackendCall,
} from "@/lib/observability/serverTelemetry";

type RouteParameters = { params: Promise<{ path: string[] }> };

const TAG = "[SignalR Proxy]";

/**
 * Proxy for SignalR hub connections.
 *
 * The same-origin BFF supports ordinary SignalR HTTP transports (the client uses
 * Long Polling for this route), not transparent WebSocket tunneling. If a caller
 * supplies the WebSocket-style `access_token` query parameter, convert it to the
 * Authorization header and remove it from the backend URL so secrets never enter
 * server access logs or telemetry URL attributes.
 */
async function handle(request: NextRequest, parameters: RouteParameters) {
  const correlationId = createCorrelationId();
  annotateActiveBffRequest({
    channel: "signalr",
    correlationId,
    method: request.method,
    route: "/api/hubs/[...path]",
  });

  if (isCrossSiteMutation(request)) {
    return problemResponse(
      403,
      "Cross-site request rejected",
      "CrossSiteRequestRejected",
      correlationId,
    );
  }

  const { path } = await parameters.params;
  if (hasUnsafeBackendPath(path)) {
    return problemResponse(400, "Invalid backend path", "UnsafeBackendPath", correlationId);
  }
  const hubPath = path.join("/");

  const backendUrl = new URL(`${resolveRequestBackendUrl(request)}/hubs/${hubPath}`);
  // Preserve SignalR transport parameters, but never put bearer tokens in the URL.
  backendUrl.search = request.nextUrl.search;

  const authHeader = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("access_token");
  backendUrl.searchParams.delete("access_token");

  const forwardHeaders = new Headers();
  for (const name of ["content-type", "user-agent"] as const) {
    const value = request.headers.get(name);
    if (value) forwardHeaders.set(name, value);
  }
  if (authHeader) {
    forwardHeaders.set("authorization", authHeader);
  } else if (queryToken) {
    forwardHeaders.set("authorization", `Bearer ${queryToken}`);
  }
  applyCorrelationHeader(forwardHeaders, correlationId);

  const isBodyless = request.method === "GET" || request.method === "HEAD";

  let backendResponse: Response;
  try {
    backendResponse = await traceBackendCall(
      {
        channel: "signalr",
        correlationId,
        method: request.method,
        route: "/api/hubs/[...path]",
      },
      async () => {
        const body = isBodyless ? undefined : await request.arrayBuffer();
        return fetch(backendUrl, {
          method: request.method,
          headers: forwardHeaders,
          body,
          cache: "no-store",
          redirect: "manual",
        });
      },
    );
  } catch (err) {
    console.error(`${TAG} Backend unreachable`, {
      failureKind: err instanceof DOMException ? err.name : "network",
      correlationId,
    });
    return problemResponse(
      503,
      "SignalR backend unavailable",
      "SignalRBackendUnavailable",
      correlationId,
    );
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-length"] as const) {
    const value = backendResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  applyCorrelationHeader(responseHeaders, correlationId);
  responseHeaders.set("cache-control", "no-store");

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
  recordBffResponse(response.status);
  return response;
}

function problemResponse(
  status: number,
  title: string,
  code: string,
  correlationId: string,
) {
  const response = NextResponse.json(
    { type: "about:blank", title, status, detail: title, code },
    {
      status,
      headers: {
        "content-type": "application/problem+json",
        "cache-control": "no-store",
      },
    },
  );
  applyCorrelationHeader(response.headers, correlationId);
  recordBffResponse(status);
  return response;
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
