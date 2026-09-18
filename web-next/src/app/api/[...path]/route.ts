import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_REFRESHED_HEADER } from "@/lib/auth/constants";
import {
  isAuthPayload,
  readAuthTokens,
  sanitizeAuthPayload,
  setAuthCookies,
  type AuthPayload
} from "@/lib/auth/cookies";
import { refreshAuthTokens } from "@/lib/auth/backend-session";
import { shouldRefreshAccessToken } from "@/lib/auth/token-expiration";
import {
  copyBackendResponseHeaders,
  prepareBackendBody,
  RequestBodyTooLargeError,
  type PreparedBackendBody,
} from "@/lib/api/proxy-transport";
import {
  hasUnsafeBackendPath,
  isCrossSiteMutation,
} from "@/lib/api/proxy-security";
import { getBufferedBodyLimit, resolveRequestBackendUrl } from "@/lib/env/server";
import {
  applyCorrelationHeader,
  createCorrelationId,
} from "@/lib/observability/correlation";
import {
  annotateActiveBffRequest,
  recordBffResponse,
  traceBackendCall,
} from "@/lib/observability/serverTelemetry";

const backendRequestTimeoutMs = 30_000;
const reportRenderTimeoutMs = 120_000;

type RouteParameters = { params: Promise<{ path: string[] }> };

const forwardedHeaders = [
  "accept",
  "content-type",
  "culture",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "range",
  "user-agent",
] as const;

function createBackendHeaders(
  request: NextRequest,
  token: string | undefined,
  correlationId: string,
) {
  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);
  applyCorrelationHeader(headers, correlationId);
  return headers;
}

async function callBackend(
  request: NextRequest,
  path: string[],
  token: string | undefined,
  preparedBody: PreparedBackendBody,
  correlationId: string,
) {
  const backendPath = resolveBackendPath(path);
  const url = new URL(`${resolveRequestBackendUrl(request)}/${backendPath}`);
  url.search = request.nextUrl.search;

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: createBackendHeaders(request, token, correlationId),
    body: preparedBody.body,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(isCrystalReportRender(path)
      ? reportRenderTimeoutMs
      : backendRequestTimeoutMs),
  };
  if (preparedBody.streaming) init.duplex = "half";

  return traceBackendCall(
    {
      channel: "api",
      correlationId,
      method: request.method,
      route: "/api/[...path]",
    },
    () => fetch(url, init),
  );
}

function isCrystalReportRender(path: string[]) {
  return path.length === 4 &&
    path[0] === "v1" &&
    path[1] === "crystal-reports" &&
    path[3] === "render";
}

function resolveBackendPath(path: string[]) {
  if (path.length === 1 && path[0] === "health") return "health";
  if (path[0] === "account-info") {
    return `AccountInfo/${path.slice(1).join("/")}`;
  }
  return `api/${path.join("/")}`;
}

async function toNextResponse(
  backendResponse: Response,
  correlationId: string,
  authPayload?: AuthPayload | null,
) {
  if ([204, 205, 304].includes(backendResponse.status)) {
    const response = new NextResponse(null, { status: backendResponse.status });
    applyAuthPayload(response, authPayload);
    copyBackendResponseHeaders(backendResponse.headers, response.headers);
    applyCorrelationHeader(response.headers, correlationId);
    response.headers.set("cache-control", "no-store");
    recordBffResponse(response.status);
    return response;
  }

  const contentType = backendResponse.headers.get("content-type") ?? "application/json";
  let response: NextResponse;

  try {
    if (contentType.includes("application/json") || /application\/[^;]+\+json/i.test(contentType)) {
      const body = await backendResponse.text();
      if (!body.trim()) {
        response = new NextResponse(null, { status: backendResponse.status });
        applyAuthPayload(response, authPayload);
        copyBackendResponseHeaders(backendResponse.headers, response.headers);
        response.headers.delete("content-length");
        applyCorrelationHeader(response.headers, correlationId);
        response.headers.set("cache-control", "no-store");
        recordBffResponse(response.status);
        return response;
      }

      const payload: unknown = JSON.parse(body);
      const discoveredAuth = isAuthPayload(payload) ? payload : authPayload;
      response = NextResponse.json(
        isAuthPayload(payload) ? sanitizeAuthPayload(payload) : payload,
        { status: backendResponse.status }
      );
      applyAuthPayload(response, discoveredAuth);
      copyBackendResponseHeaders(backendResponse.headers, response.headers);
      response.headers.delete("content-length");
    } else {
      response = new NextResponse(backendResponse.body, { status: backendResponse.status });
      copyBackendResponseHeaders(backendResponse.headers, response.headers);
      applyAuthPayload(response, authPayload);
    }
  } catch {
    console.error("[API Proxy] Invalid backend response", {
      correlationId,
      failureKind: "invalid-response-body",
    });
    const response = problemResponse(
      502,
      "Invalid response from backend service",
      "InvalidBackendResponse",
      correlationId,
    );
    applyAuthPayload(response, authPayload);
    return response;
  }

  const disposition = backendResponse.headers.get("content-disposition");
  if (disposition) response.headers.set("content-disposition", disposition);
  applyCorrelationHeader(response.headers, correlationId);
  response.headers.set("cache-control", "no-store");
  recordBffResponse(response.status);
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
  const correlationId = createCorrelationId();
  annotateActiveBffRequest({
    channel: "api",
    correlationId,
    method: request.method,
    route: "/api/[...path]",
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
  const backendUrl = resolveRequestBackendUrl(request);
  const { accessToken, refreshToken } = readAuthTokens(request.cookies);

  let preparedBody: PreparedBackendBody;
  try {
    preparedBody = await prepareBackendBody(
      request,
      getBufferedBodyLimit(),
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return problemResponse(413, "Request body is too large", "RequestBodyTooLarge", correlationId);
    }
    throw error;
  }
  let requestAccessToken = accessToken;
  let refreshedAuth: AuthPayload | null = null;

  if (
    preparedBody.streaming &&
    accessToken &&
    refreshToken &&
    shouldRefreshAccessToken(accessToken)
  ) {
    const refreshResult = await refreshAuthTokens(accessToken, refreshToken, backendUrl);
    if (refreshResult.status === "unavailable") {
      return problemResponse(
        503,
        "Authentication service unavailable",
        "AuthenticationServiceUnavailable",
        correlationId,
      );
    }
    if (refreshResult.status === "rejected") {
      return problemResponse(401, "Unauthorized", "Unauthorized", correlationId);
    }

    refreshedAuth = refreshResult.payload;
    requestAccessToken = refreshedAuth.token;
  }

  let backendResponse: Response;
  try {
    backendResponse = await callBackend(
      request,
      path,
      requestAccessToken,
      preparedBody,
      correlationId,
    );
  } catch (error) {
    const response = backendFailureResponse(error, correlationId);
    applyAuthPayload(response, refreshedAuth);
    return response;
  }

  // Only attempt ONE refresh per request (not multiple concurrent ones)
  if (
    backendResponse.status === 401 &&
    preparedBody.replayable &&
    !refreshedAuth &&
    accessToken &&
    refreshToken
  ) {
    const refreshResult = await refreshAuthTokens(accessToken, refreshToken, backendUrl);
    
    if (refreshResult.status === "unavailable") {
      return problemResponse(
        503,
        "Authentication service unavailable",
        "AuthenticationServiceUnavailable",
        correlationId,
      );
    }
    
    if (refreshResult.status === "refreshed") {
      refreshedAuth = refreshResult.payload;
      try {
        backendResponse = await callBackend(
          request,
          path,
          refreshedAuth.token,
          preparedBody,
          correlationId,
        );
      } catch (error) {
        const response = backendFailureResponse(error, correlationId);
        applyAuthPayload(response, refreshedAuth);
        return response;
      }
    }
  }

  const response = await toNextResponse(
    backendResponse,
    correlationId,
    refreshedAuth,
  );
  return response;
}

function backendFailureResponse(error: unknown, correlationId: string) {
  const timedOut = error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError");

  return problemResponse(
    timedOut ? 504 : 502,
    timedOut ? "Backend request timed out" : "Backend service unavailable",
    timedOut ? "BackendRequestTimedOut" : "BackendServiceUnavailable",
    correlationId,
  );
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
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
