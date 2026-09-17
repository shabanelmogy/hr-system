import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  getBackendUrl: () => "https://api.example.test",
  resolveRequestBackendUrl: () => "https://api.example.test",
}));
vi.mock("@/lib/auth/backend-session", () => ({
  refreshAuthTokens: vi.fn().mockResolvedValue({ status: "rejected" }),
}));

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Hangfire BFF hardening", () => {
  it("does not clear newer auth cookies when an older request finishes 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unauthorized", { status: 401 })));

    const response = await GET(
      new NextRequest("https://app.example.test/hangfire/jobs", {
        headers: {
          cookie: "__Host-hrms-access-token=stale-access; __Host-hrms-refresh-token=stale-refresh",
        },
      }),
      parameters("jobs"),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("strips forwarding identity headers before proxying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await GET(
      new NextRequest("https://app.example.test/hangfire", {
        headers: {
          "x-forwarded-for": "198.51.100.7",
          forwarded: "for=198.51.100.7",
          "x-real-ip": "198.51.100.7",
          "x-test-header": "allowed",
        },
      }),
      parameters(),
    );

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("x-forwarded-for")).toBeNull();
    expect(headers.get("forwarded")).toBeNull();
    expect(headers.get("x-real-ip")).toBeNull();
    expect(headers.get("x-test-header")).toBe("allowed");
  });

  it("rejects unsafe dashboard paths before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://app.example.test/hangfire/%2E%2E/secret"),
      parameters("%2E%2E", "secret"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

function parameters(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}
