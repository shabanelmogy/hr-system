import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  resolveRequestBackendUrl: () => "https://staging-api.example.test",
}));

import { POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("logout BFF", () => {
  it("revokes the refresh token against the request-selected backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new NextRequest("https://app.example.test/api/auth/logout", {
      method: "POST",
      headers: { cookie: "__Host-hrms-refresh-token=refresh-token" },
    }));

    expect(response.status).toBe(204);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://staging-api.example.test/api/v1/auth/logOut");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(response.headers.get("set-cookie")).toContain("__Host-hrms-refresh-token=");
  });

  it("still clears local cookies when backend revocation fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("backend unavailable")));

    const response = await POST(new NextRequest("https://app.example.test/api/auth/logout", {
      method: "POST",
      headers: { cookie: "__Host-hrms-refresh-token=refresh-token" },
    }));

    expect(response.status).toBe(204);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("rejects cross-site logout requests without revoking or clearing the session", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new NextRequest("https://app.example.test/api/auth/logout", {
      method: "POST",
      headers: {
        origin: "https://evil.example.test",
        cookie: "__Host-hrms-refresh-token=refresh-token",
      },
    }));

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
