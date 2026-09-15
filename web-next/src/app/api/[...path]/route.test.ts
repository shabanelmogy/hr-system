import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  getBackendUrl: () => "https://api.example.test",
  getBufferedBodyLimit: () => {
    const value = process.env.BFF_MAX_BUFFERED_BODY_BYTES;
    return value === undefined ? 10 * 1024 * 1024 : Number(value);
  },
  resolveRequestBackendUrl: () => "https://api.example.test",
}));

import { GET, POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API BFF transport", () => {
  it("does not clear cookies when an older protected request finishes unauthorized", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(
      { title: "Unauthorized" },
      { status: 401 },
    )));

    const response = await GET(
      new NextRequest("https://app.example.test/api/v1/countries/getAll", {
        headers: { cookie: "__Host-hrms-access-token=stale-access-token" },
      }),
      parameters("v1", "countries", "getAll"),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("replaces auth cookies when an authenticated company switch returns a new session", async () => {
    const switchedAuth = {
      id: "user-id",
      tenantId: "tenant-id",
      tenantName: "Tenant",
      tenantPlanName: "Professional",
      companyId: 8,
      companyCode: "COMP-8",
      companyNameAr: "الشركة الثامنة",
      companyNameEn: "Company Eight",
      token: "new-access-token",
      tokenExpiration: new Date(Date.now() + 60_000).toISOString(),
      refreshToken: "new-refresh-token",
      refreshTokenExpiration: new Date(Date.now() + 86_400_000).toISOString(),
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(switchedAuth));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/v1/auth/switchCompany", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: "__Host-hrms-access-token=old-access-token; __Host-hrms-refresh-token=old-refresh-token",
        },
        body: JSON.stringify({ companyId: 8 }),
      }),
      parameters("v1", "auth", "switchCompany"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      isAuthenticated: true,
      companyId: 8,
      companyCode: "COMP-8",
    });
    expect(response.headers.get("set-cookie")).toContain("new-access-token");
    expect(response.headers.get("set-cookie")).toContain("new-refresh-token");
    expect(response.headers.get("x-hrms-session-refreshed")).toBe("1");

    const [backendUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(backendUrl.toString()).toBe("https://api.example.test/api/v1/auth/switchCompany");
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer old-access-token");
  });

  it("streams range responses and preserves media headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("video bytes", {
      status: 206,
      headers: {
        "accept-ranges": "bytes",
        "content-range": "bytes 0-10/100",
        "content-type": "video/mp4",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://app.example.test/api/v1/Files/Stream/file-id", {
        headers: { range: "bytes=0-10" },
      }),
      parameters("v1", "Files", "Stream", "file-id"),
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("content-range")).toBe("bytes 0-10/100");
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(await response.text()).toBe("video bytes");

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(new Headers(init.headers).get("range")).toBe("bytes=0-10");
  });

  it("forwards multipart uploads as streams instead of ArrayBuffers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(["file-id"]));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/v1/Files/UploadMany", {
        method: "POST",
        headers: { "content-type": "multipart/form-data; boundary=test" },
        body: "multipart payload",
      }),
      parameters("v1", "Files", "UploadMany"),
    );

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { duplex?: string }];
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect(init.duplex).toBe("half");
    expect(new Headers(init.headers).get("x-forwarded-for")).toBeNull();
  });

  it("preserves problem details metadata and does not trust forwarded client IPs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ type: "urn:problem", title: "Scanner unavailable", status: 503, code: "FileScannerUnavailable" }),
      { status: 503, headers: { "content-type": "application/problem+json", "retry-after": "10", "x-correlation-id": "corr-1" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/v1/Files/Upload", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.1" },
        body: JSON.stringify({}),
      }),
      parameters("v1", "Files", "Upload"),
    );

    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect(response.headers.get("retry-after")).toBe("10");
    expect(response.headers.get("x-correlation-id")).toBe("corr-1");
    await expect(response.json()).resolves.toMatchObject({ code: "FileScannerUnavailable" });
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(new Headers(init.headers).get("x-forwarded-for")).toBeNull();
  });

  it("returns a Problem Details 413 before calling the backend for oversized JSON", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const previous = process.env.BFF_MAX_BUFFERED_BODY_BYTES;
    process.env.BFF_MAX_BUFFERED_BODY_BYTES = "4";
    try {
      const response = await POST(
        new NextRequest("https://app.example.test/api/v1/countries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "12345",
        }),
        parameters("v1", "countries"),
      );
      expect(response.status).toBe(413);
      expect(response.headers.get("content-type")).toContain("application/problem+json");
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.BFF_MAX_BUFFERED_BODY_BYTES;
      else process.env.BFF_MAX_BUFFERED_BODY_BYTES = previous;
    }
  });

  it("rejects unsafe catch-all path segments before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(
      new NextRequest("https://app.example.test/api/v1/Files/%2E%2E/secret"),
      parameters("v1", "Files", "%2E%2E", "secret"),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({ type: "about:blank", code: "UnsafeBackendPath" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["%3Fquery", "%23fragment"])("rejects encoded URL delimiter %s before fetching", async (unsafeSegment) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET(
      new NextRequest(`https://app.example.test/api/v1/Files/${unsafeSegment}`),
      parameters("v1", "Files", unsafeSegment),
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function parameters(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}
