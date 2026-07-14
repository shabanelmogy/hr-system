import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/backend-session";
import { clearAuthCookies, readAuthTokens, setAuthCookies } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );
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
  if (resolved.authPayload ?? migrationPayload) {
    setAuthCookies(response, resolved.authPayload ?? migrationPayload!);
  }
  return response;
}
