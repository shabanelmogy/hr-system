import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveSession } from "@/lib/auth/backend-session";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl } from "@/lib/env/server";

const TAG = "[Realtime Token]";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const resolved = await resolveSession(accessToken, refreshToken);

  if (resolved.status === "unavailable") {
    console.warn(`${TAG} Auth service unavailable`);
    const response = NextResponse.json(
      { message: "Authentication service unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
    if (resolved.authPayload) setAuthCookies(response, resolved.authPayload);
    return response;
  }

  if (resolved.status === "unauthenticated") {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  const currentAccessToken = resolved.authPayload?.token ?? accessToken;
  if (!currentAccessToken) {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  try {
    const backendUrl = `${getBackendUrl()}/api/v1/auth/realtimeToken`;
    const backendResponse = await fetch(backendUrl, {
      headers: { authorization: `Bearer ${currentAccessToken}` },
      cache: "no-store",
    });

    if (!backendResponse.ok) {
      console.warn(`${TAG} Backend returned ${backendResponse.status}`);
      const response = NextResponse.json(
        { message: backendResponse.status === 401 ? "Unauthorized" : "Realtime service unavailable" },
        { status: backendResponse.status === 401 ? 401 : 503 },
      );
      if (backendResponse.status === 401) clearAuthCookies(response);
      return response;
    }

    const payload = (await backendResponse.json()) as { token?: unknown };
    if (typeof payload.token !== "string") {
      console.warn(`${TAG} Invalid token response`);
      return NextResponse.json({ message: "Invalid realtime token response" }, { status: 502 });
    }

    const response = NextResponse.json(
      { token: payload.token },
      { headers: { "cache-control": "no-store" } },
    );
    if (resolved.authPayload) {
      setAuthCookies(response, resolved.authPayload);
    }
    return response;
  } catch (err) {
    console.error(`${TAG} Backend fetch error:`, err);
    return NextResponse.json({ message: "Realtime service unavailable" }, { status: 503 });
  }
}
