import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { getBackendUrl } from "@/lib/env/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    try {
      await fetch(`${getBackendUrl()}/api/v1/auth/logOut`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
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
