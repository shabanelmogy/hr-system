import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/backend-session";
import { readAuthTokens, setAuthCookies } from "@/lib/auth/cookies";
import { resolveRequestBackendUrl } from "@/lib/env/server";

export async function GET(request: NextRequest) {
  const { accessToken, refreshToken, migrationPayload } = readAuthTokens(
    request.cookies,
  );
  const resolved = await resolveSession(
    accessToken,
    refreshToken,
    resolveRequestBackendUrl(request),
  );

  if (resolved.status === "unavailable") {
    const response = NextResponse.json(
      { message: "Authentication service unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
    if (resolved.authPayload) setAuthCookies(response, resolved.authPayload);
    return response;
  }

  if (resolved.status === "unauthenticated") {
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
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
