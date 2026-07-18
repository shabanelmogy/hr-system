import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { refreshAuthTokens } from "@/lib/auth/backend-session";
import {
  clearAuthCookies,
  readAuthTokens,
  setAuthCookies,
  type AuthPayload,
} from "@/lib/auth/cookies";
import {
  createHangfireBackendPath,
  isHangfireAntiforgeryCookie,
  rewriteHangfireAntiforgeryCookie,
  rewriteHangfireLocation,
} from "@/lib/api/hangfireProxy";
import { getBackendUrl } from "@/lib/env/server";

type RouteParameters = { params: Promise<{ path?: string[] }> };

const excludedRequestHeaders = new Set([
  "authorization",
  "connection",
  "content-length",
  "cookie",
  "host",
  "origin",
  "referer",
  "transfer-encoding",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
]);

const excludedResponseHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "set-cookie",
  "transfer-encoding",
]);

async function handle(request: NextRequest, parameters: RouteParameters) {
  if (isCrossSiteMutation(request)) {
    return NextResponse.json({ title: "Cross-site request rejected" }, { status: 403 });
  }

  const { path = [] } = await parameters.params;
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );
  const body = request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();

  let backendResponse: Response;
  try {
    backendResponse = await callBackend(request, path, accessToken, body);
  } catch {
    return NextResponse.json(
      { title: "Hangfire dashboard is unavailable" },
      { status: 502 },
    );
  }

  let refreshedAuth: AuthPayload | null = null;
  if (backendResponse.status === 401 && accessToken && refreshToken) {
    const refreshResult = await refreshAuthTokens(accessToken, refreshToken);
    if (refreshResult.status === "unavailable") {
      return NextResponse.json(
        { title: "Authentication service unavailable" },
        { status: 503 },
      );
    }

    if (refreshResult.status === "refreshed") {
      refreshedAuth = refreshResult.payload;
      try {
        backendResponse = await callBackend(
          request,
          path,
          refreshedAuth.token,
          body,
        );
      } catch {
        const response = NextResponse.json(
          { title: "Hangfire dashboard is unavailable" },
          { status: 502 },
        );
        setAuthCookies(response, refreshedAuth);
        return response;
      }
    }
  }

  const response = await createProxyResponse(
    backendResponse,
    refreshedAuth ?? migrationPayload,
    request.method !== "HEAD",
  );
  if (backendResponse.status === 401 && !refreshedAuth) {
    clearAuthCookies(response);
  }
  return response;
}

async function callBackend(
  request: NextRequest,
  path: readonly string[],
  accessToken?: string,
  body?: ArrayBuffer,
) {
  const backendBaseUrl = getBackendUrl();
  const url = new URL(createHangfireBackendPath(path), backendBaseUrl);
  url.search = request.nextUrl.search;

  return fetch(url, {
    method: request.method,
    headers: createBackendHeaders(request, accessToken),
    body,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(30_000),
  });
}

function createBackendHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers();
  request.headers.forEach((value, name) => {
    if (!excludedRequestHeaders.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  });

  const antiforgeryCookies = request.cookies
    .getAll()
    .filter(({ name }) => isHangfireAntiforgeryCookie(name))
    .map(({ name, value }) => `${name}=${value}`);
  if (antiforgeryCookies.length > 0) {
    headers.set("cookie", antiforgeryCookies.join("; "));
  }
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  return headers;
}

async function createProxyResponse(
  backendResponse: Response,
  authPayload?: AuthPayload | null,
  includeBody = true,
) {
  const headers = new Headers();
  backendResponse.headers.forEach((value, name) => {
    if (!excludedResponseHeaders.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  });

  const location = rewriteHangfireLocation(
    backendResponse.headers.get("location"),
    getBackendUrl(),
  );
  if (location) headers.set("location", location);

  const response = new NextResponse(
    includeBody && hasResponseBody(backendResponse.status)
      ? await backendResponse.arrayBuffer()
      : null,
    { status: backendResponse.status, headers },
  );

  for (const cookie of getSetCookies(backendResponse.headers)) {
    const rewrittenCookie = rewriteHangfireAntiforgeryCookie(cookie);
    if (rewrittenCookie) response.headers.append("set-cookie", rewrittenCookie);
  }
  if (authPayload) setAuthCookies(response, authPayload);
  response.headers.set("cache-control", "no-store");
  return response;
}

function getSetCookies(headers: Headers): string[] {
  const enhancedHeaders = headers as Headers & { getSetCookie?: () => string[] };
  return enhancedHeaders.getSetCookie?.() ??
    (headers.get("set-cookie") ? [headers.get("set-cookie")!] : []);
}

function hasResponseBody(status: number) {
  return ![204, 205, 304].includes(status);
}

function isCrossSiteMutation(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return false;
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;

  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== request.nextUrl.origin);
}

export const dynamic = "force-dynamic";

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
