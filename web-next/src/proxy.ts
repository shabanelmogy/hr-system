import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isPublicRoute } from "@/lib/auth/constants";
import {
  clearAuthCookies,
  readAuthTokens,
} from "@/lib/auth/cookies";
import { appRoutes } from "@/config/routes";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { accessToken, refreshToken } = readAuthTokens(request.cookies);

  // Keep Proxy optimistic and network-free. The session Route Handler and the
  // backend API remain authoritative for authentication and authorization.
  if (!accessToken) {
    if (isPublicRoute(pathname)) {
      const response = NextResponse.next();
      if (refreshToken) clearAuthCookies(response);
      return response;
    }

    const loginUrl = new URL(appRoutes.auth.login, request.url);
    loginUrl.searchParams.set(
      "returnTo",
      `${pathname}${request.nextUrl.search}`,
    );
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(appRoutes.shell.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
