import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  isPublicRoute,
} from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { resolveSession, type ResolvedSession } from "@/lib/auth/backend-session";
import {
  canAccessRoute,
  isKnownProtectedRoute,
  UNAVAILABLE_ROUTE,
} from "@/lib/auth/route-access";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  
  const resolved = await resolveSession(accessToken, refreshToken);

  if (resolved.status === "unavailable") {
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = UNAVAILABLE_ROUTE;
    unavailableUrl.search = "";
    return NextResponse.rewrite(unavailableUrl, { status: 503 });
  }

  if (resolved.status === "unauthenticated") {
    if (isPublicRoute(pathname)) {
      const response = NextResponse.next();
      if (accessToken || refreshToken) clearAuthCookies(response);
      return response;
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  if (isPublicRoute(pathname)) {
    return applyRefreshedCookies(
      NextResponse.redirect(new URL("/", request.url)),
      resolved,
    );
  }

  if (!isKnownProtectedRoute(pathname) || !canAccessRoute(pathname, resolved.session)) {
    const unavailableUrl = request.nextUrl.clone();
    unavailableUrl.pathname = UNAVAILABLE_ROUTE;
    unavailableUrl.search = "";
    return applyRefreshedCookies(
      NextResponse.rewrite(unavailableUrl, { status: 404 }),
      resolved,
    );
  }

  return applyRefreshedCookies(NextResponse.next(), resolved);
}

function applyRefreshedCookies(response: NextResponse, resolved: ResolvedSession) {
  if (resolved.status === "authenticated" && resolved.authPayload) {
    setAuthCookies(response, resolved.authPayload);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
