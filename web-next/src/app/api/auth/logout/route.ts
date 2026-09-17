import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthCookies, readAuthTokens } from "@/lib/auth/cookies";
import { isCrossSiteMutation } from "@/lib/api/proxy-security";
import { resolveRequestBackendUrl } from "@/lib/env/server";

const backendLogoutTimeoutMs = 3_000;

export async function POST(request: NextRequest) {
  if (isCrossSiteMutation(request)) {
    return NextResponse.json(
      { type: "about:blank", title: "Cross-site request rejected", status: 403, code: "CrossSiteRequestRejected" },
      { status: 403, headers: { "content-type": "application/problem+json", "cache-control": "no-store" } },
    );
  }

  const { refreshToken } = readAuthTokens(request.cookies);

  if (refreshToken) {
    try {
      await fetch(`${resolveRequestBackendUrl(request)}/api/v1/auth/logOut`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(backendLogoutTimeoutMs),
      });
    } catch {
      // Local cookie deletion must still succeed if the backend is unavailable.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  clearAuthCookies(response);
  
  // Ensure no caching of this response
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  
  return response;
}
