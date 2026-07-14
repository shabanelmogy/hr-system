import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  INTERNAL_SESSION_HEADER,
  isPublicRoute,
} from "@/lib/auth/constants";
import {
  clearAuthCookies,
  readAuthTokens,
  setAuthCookies,
} from "@/lib/auth/cookies";
import {
  resolveSession,
  type ResolvedSession,
} from "@/lib/auth/backend-session";
import {
  canAccessRoute,
  UNAVAILABLE_ROUTE,
} from "@/lib/auth/route-access";
import { encodeRequestSession } from "@/lib/auth/request-session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );

  const resolved = await resolveSession(accessToken, refreshToken);

  if (resolved.status === "unavailable") {
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = UNAVAILABLE_ROUTE;
    unavailableUrl.search = "";
    unavailableUrl.searchParams.set("reason", "service");
    unavailableUrl.searchParams.set(
      "returnTo",
      `${pathname}${request.nextUrl.search}`,
    );
    return applyRefreshedCookies(
      rewriteWithSession(request, unavailableUrl, 503, resolved),
      resolved,
      migrationPayload,
    );
  }

  if (resolved.status === "unauthenticated") {
    if (isPublicRoute(pathname)) {
      const response = nextWithSession(request, resolved);
      if (accessToken || refreshToken) clearAuthCookies(response);
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${pathname}${request.nextUrl.search}`,
    );
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  if (isPublicRoute(pathname)) {
    return applyRefreshedCookies(
      NextResponse.redirect(new URL("/", request.url)),
      resolved,
      migrationPayload,
    );
  }

  if (!canAccessRoute(pathname, resolved.session)) {
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = UNAVAILABLE_ROUTE;
    unavailableUrl.search = "";
    unavailableUrl.searchParams.set("reason", "access");
    return applyRefreshedCookies(
      rewriteWithSession(request, unavailableUrl, 404, resolved),
      resolved,
      migrationPayload,
    );
  }

  return applyRefreshedCookies(
    nextWithSession(request, resolved),
    resolved,
    migrationPayload,
  );
}

function requestHeadersWithSession(
  request: NextRequest,
  resolved: ResolvedSession,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(INTERNAL_SESSION_HEADER);

  if (resolved.status === "authenticated") {
    requestHeaders.set(
      INTERNAL_SESSION_HEADER,
      encodeRequestSession(resolved.session),
    );
  }

  return requestHeaders;
}

function nextWithSession(request: NextRequest, resolved: ResolvedSession) {
  return NextResponse.next({
    request: { headers: requestHeadersWithSession(request, resolved) },
  });
}

function rewriteWithSession(
  request: NextRequest,
  url: URL,
  status: number,
  resolved: ResolvedSession,
) {
  return NextResponse.rewrite(url, {
    status,
    request: { headers: requestHeadersWithSession(request, resolved) },
  });
}

function applyRefreshedCookies(
  response: NextResponse,
  resolved: ResolvedSession,
  migrationPayload?: Parameters<typeof setAuthCookies>[1],
) {
  const authPayload = resolved.authPayload ?? migrationPayload;
  if (authPayload) {
    setAuthCookies(response, authPayload);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
