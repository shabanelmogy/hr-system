import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/backend-session";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const resolved = await resolveSession(accessToken, refreshToken);

  if (resolved.status === "unavailable") {
    const response = NextResponse.json(
      { message: "Authentication service unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
    if (resolved.authPayload) setAuthCookies(response, resolved.authPayload);
    return response;
  }

  if (resolved.status === "unauthenticated") {
    const response = NextResponse.json(
      { isAuthenticated: false },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json(
    { isAuthenticated: true, user: resolved.session },
    { headers: { "cache-control": "no-store" } },
  );
  if (resolved.authPayload) setAuthCookies(response, resolved.authPayload);
  return response;
}
