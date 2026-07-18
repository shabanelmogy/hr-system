import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_REFRESHED_HEADER } from "@/lib/auth/constants";
import {
  clearAuthCookies,
  isAuthPayload,
  readAuthTokens,
  sanitizeAuthPayload,
  setAuthCookies,
  type AuthPayload
} from "@/lib/auth/cookies";
import { refreshAuthTokens } from "@/lib/auth/backend-session";
import { getBackendUrl } from "@/lib/env/server";

const TAG = "[📡 API Proxy]";

type RouteParameters = { params: Promise<{ path: string[] }> };

const forwardedHeaders = [
  "accept",
  "content-type",
  "culture",
  "user-agent",
  "x-forwarded-for",
] as const;

function createBackendHeaders(request: NextRequest, token?: string) {
  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
}

async function requestBody(request: NextRequest) {
  return request.method === "GET" || request.method === "HEAD"
    ? undefined
    : await request.arrayBuffer();
}

async function callBackend(request: NextRequest, path: string[], token?: string, body?: ArrayBuffer) {
  const backendPath = resolveBackendPath(path);
  const url = new URL(`${getBackendUrl()}/${backendPath}`);
  url.search = request.nextUrl.search;

  return fetch(url, {
    method: request.method,
    headers: createBackendHeaders(request, token),
    body,
    cache: "no-store",
    redirect: "manual"
  });
}

function resolveBackendPath(path: string[]) {
  if (path.length === 1 && path[0] === "health") return "health";
  if (path[0] === "account-info") {
    return `AccountInfo/${path.slice(1).join("/")}`;
  }
  return `api/${path.join("/")}`;
}

async function toNextResponse(backendResponse: Response, authPayload?: AuthPayload | null) {
  console.log(`${TAG} Backend returned status: ${backendResponse.status}`);
  if ([204, 205, 304].includes(backendResponse.status)) {
    const response = new NextResponse(null, { status: backendResponse.status });
    applyAuthPayload(response, authPayload);
    response.headers.set("cache-control", "no-store");
    return response;
  }

  const contentType = backendResponse.headers.get("content-type") ?? "application/json";
  let response: NextResponse;

  try {
    if (contentType.includes("application/json")) {
      const body = await backendResponse.text();
      if (!body.trim()) {
        response = new NextResponse(null, { status: backendResponse.status });
        applyAuthPayload(response, authPayload);
        response.headers.set("cache-control", "no-store");
        return response;
      }

      const payload: unknown = JSON.parse(body);
      const discoveredAuth = isAuthPayload(payload) ? payload : authPayload;
      response = NextResponse.json(
        isAuthPayload(payload) ? sanitizeAuthPayload(payload) : payload,
        { status: backendResponse.status }
      );
      applyAuthPayload(response, discoveredAuth);
    } else {
      response = new NextResponse(await backendResponse.arrayBuffer(), {
        status: backendResponse.status,
        headers: { "content-type": contentType }
      });
      applyAuthPayload(response, authPayload);
    }
  } catch (error) {
    console.error(`${TAG} Invalid backend response body`, error);
    const response = NextResponse.json(
      { title: "Invalid response from backend service" },
      { status: 502 },
    );
    applyAuthPayload(response, authPayload);
    return response;
  }

  const disposition = backendResponse.headers.get("content-disposition");
  if (disposition) response.headers.set("content-disposition", disposition);
  response.headers.set("cache-control", "no-store");
  return response;
}

function applyAuthPayload(
  response: NextResponse,
  authPayload?: AuthPayload | null,
) {
  if (!authPayload) return;

  setAuthCookies(response, authPayload);
  response.headers.set(SESSION_REFRESHED_HEADER, "1");
}

async function handle(request: NextRequest, parameters: RouteParameters) {
  if (isCrossSiteMutation(request)) {
    return NextResponse.json({ title: "Cross-site request rejected" }, { status: 403 });
  }

  const { path } = await parameters.params;
  const route = path.join("/");
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );

  console.log(`${TAG} 📋 Request to /api/${route}`);
  const body = await requestBody(request);
  let backendResponse: Response;
  try {
    backendResponse = await callBackend(request, path, accessToken, body);
  } catch (error) {
    console.error(`${TAG} Error calling backend:`, error);
    return NextResponse.json({ title: "Backend service unavailable", details: String(error) }, { status: 502 });
  }

  let refreshedAuth: AuthPayload | null = null;

  // Only attempt ONE refresh per request (not multiple concurrent ones)
  if (backendResponse.status === 401 && accessToken && refreshToken) {
    console.log(`${TAG} 🔄 Got 401, attempting token refresh for /api/${route}`);
    const refreshResult = await refreshAuthTokens(accessToken, refreshToken);
    
    if (refreshResult.status === "unavailable") {
      console.warn(`${TAG} ❌ Auth service unavailable during refresh`);
      return NextResponse.json({ title: "Authentication service unavailable" }, { status: 503 });
    }
    
    if (refreshResult.status === "refreshed") {
      console.log(`${TAG} ✅ Token refreshed successfully!`);
      console.log(`${TAG} 🔁 Retrying /api/${route} with new token...`);
      refreshedAuth = refreshResult.payload;
      try {
        backendResponse = await callBackend(request, path, refreshedAuth.token, body);
        console.log(`${TAG} ✅ Retry successful: ${backendResponse.status} for /api/${route}`);
      } catch {
        const response = NextResponse.json(
          { title: "Backend service unavailable" },
          { status: 502 },
        );
        applyAuthPayload(response, refreshedAuth);
        return response;
      }
    } else {
      console.warn(`${TAG} ❌ Refresh rejected for /api/${route}`);
    }
  }

  const response = await toNextResponse(
    backendResponse,
    refreshedAuth ?? migrationPayload,
  );
  if (backendResponse.status === 401 && !refreshedAuth) {
    console.warn(`${TAG} ❌ Clearing auth cookies — 401 with no successful refresh`);
    clearAuthCookies(response);
  }
  return response;
}

function isCrossSiteMutation(request: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return true;

  const origin = request.headers.get("origin");
  return Boolean(origin && origin !== request.nextUrl.origin);
}

export const dynamic = "force-dynamic";

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
