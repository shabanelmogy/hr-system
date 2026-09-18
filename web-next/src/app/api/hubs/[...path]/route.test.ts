import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/env/server", () => ({
  resolveRequestBackendUrl: () => "https://api.example.test",
}));

import { GET, POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SignalR BFF hardening", () => {
  it("never forwards caller-supplied client IP headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/hubs/erp/negotiate?negotiateVersion=1", {
        method: "POST",
        headers: {
          authorization: "Bearer realtime-token",
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.77",
          forwarded: "for=198.51.100.77",
        },
        body: "{}",
      }),
      parameters("erp", "negotiate"),
    );

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    const correlationId = headers.get("x-correlation-id");
    expect(headers.get("authorization")).toBe("Bearer realtime-token");
    expect(headers.get("x-forwarded-for")).toBeNull();
    expect(headers.get("forwarded")).toBeNull();
    expect(correlationId).toMatch(/^[A-Za-z0-9._-]+$/);
    expect(response.headers.get("x-correlation-id")).toBe(correlationId);
  });

  it("moves query-string access tokens into Authorization before the backend fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(
      new NextRequest("https://app.example.test/api/hubs/erp?id=connection-1&access_token=secret-token"),
      parameters("erp"),
    );

    const [backendUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(backendUrl.searchParams.get("id")).toBe("connection-1");
    expect(backendUrl.searchParams.has("access_token")).toBe(false);
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer secret-token");
  });

  it("rejects unsafe hub paths before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://app.example.test/api/hubs/%2E%2E/secret"),
      parameters("%2E%2E", "secret"),
    );

    expect(response.status).toBe(400);
    expect(response.headers.get("x-correlation-id")).toMatch(/^[A-Za-z0-9._-]+$/);
    await expect(response.json()).resolves.toMatchObject({ code: "UnsafeBackendPath" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects cross-site negotiate requests before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/hubs/erp/negotiate", {
        method: "POST",
        headers: { origin: "https://evil.example.test" },
        body: "{}",
      }),
      parameters("erp", "negotiate"),
    );

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function parameters(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}
