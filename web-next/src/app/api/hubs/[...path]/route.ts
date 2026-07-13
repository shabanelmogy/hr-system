import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/env/server";

type RouteParameters = { params: Promise<{ path: string[] }> };

const TAG = "[SignalR Proxy]";

/**
 * Proxy for SignalR hub connections.
 *
 * The SignalR JS client sends the realtime JWT as:
 *  - An `Authorization: Bearer <token>` header on negotiate and long-polling requests.
 *  - A `?access_token=<token>` query parameter on WebSocket upgrade requests.
 *
 * We forward both so the backend can authenticate via either mechanism.
 * Running this server-side lets Node.js handle TLS with the self-signed
 * localhost cert (NODE_TLS_REJECT_UNAUTHORIZED=0).
 */
async function handle(request: NextRequest, parameters: RouteParameters) {
  const { path } = await parameters.params;
  const hubPath = path.join("/");

  const backendUrl = new URL(`${getBackendUrl()}/hubs/${hubPath}`);
  // Preserve all query parameters (access_token, negotiateVersion, id, etc.)
  backendUrl.search = request.nextUrl.search;

  const authHeader = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("access_token");
  console.log(`${TAG} ${request.method} /hubs/${hubPath}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`${TAG} Authentication: ${authHeader || queryToken ? "present" : "missing"}`);
  }

  const forwardHeaders = new Headers();
  for (const name of ["authorization", "content-type", "user-agent", "x-forwarded-for"] as const) {
    const value = request.headers.get(name);
    if (value) forwardHeaders.set(name, value);
  }

  const isBodyless = request.method === "GET" || request.method === "HEAD";

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: isBodyless ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    console.error(`${TAG} Backend unreachable:`, err);
    return NextResponse.json({ message: "SignalR backend unavailable" }, { status: 503 });
  }

  console.log(`${TAG} Backend returned ${backendResponse.status} ${backendResponse.statusText}`);

  if (backendResponse.status === 401) {
    console.warn(`${TAG} Long-poll request was unauthorized; reconnecting with a fresh token`);
  }

  const responseHeaders = new Headers();
  for (const name of ["content-type", "content-length"] as const) {
    const value = backendResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set("cache-control", "no-store");

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
