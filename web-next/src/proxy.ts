import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPublicRoute } from "@/lib/auth/constants";
import {
  clearAuthCookies,
  readAuthTokens,
  setAuthCookies,
} from "@/lib/auth/cookies";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );

  // Keep Proxy optimistic and network-free. The session Route Handler and the
  // backend API remain authoritative for authentication and authorization.
  if (!accessToken) {
    if (isPublicRoute(pathname)) {
      const response = NextResponse.next();
      if (refreshToken) clearAuthCookies(response);
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
    return applyMigratedCookies(
      NextResponse.redirect(new URL("/", request.url)),
      migrationPayload,
    );
  }

  return applyMigratedCookies(NextResponse.next(), migrationPayload);
}

function applyMigratedCookies(
  response: NextResponse,
  migrationPayload?: Parameters<typeof setAuthCookies>[1],
) {
  if (migrationPayload) setAuthCookies(response, migrationPayload);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
