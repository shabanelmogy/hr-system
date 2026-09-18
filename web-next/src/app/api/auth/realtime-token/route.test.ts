import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { resolveSessionMock } = vi.hoisted(() => ({ resolveSessionMock: vi.fn() }));

vi.mock("@/lib/auth/backend-session", () => ({ resolveSession: resolveSessionMock }));
vi.mock("@/lib/auth/cookies", () => ({
  readAuthTokens: () => ({ accessToken: "access", refreshToken: "refresh" }),
  setAuthCookies: vi.fn(),
}));
vi.mock("@/lib/env/server", () => ({
  resolveRequestBackendUrl: () => "https://api.example.test",
}));
vi.mock("@/lib/observability/serverTelemetry", () => ({
  annotateActiveVerifiedSessionScope: vi.fn(),
  classifyTransportFailure: () => "network",
}));

import { GET } from "./route";

beforeEach(() => {
  resolveSessionMock.mockResolvedValue({
    status: "authenticated",
    session: { userId: "user-1", tenantId: "tenant-1", companyId: 7 },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("realtime token BFF route", () => {
  it("returns a validated realtime token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ token: "signed-token" })));

    const response = await GET(new NextRequest("https://app.example.test/api/auth/realtime-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ token: "signed-token" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("classifies malformed successful JSON as an invalid upstream response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(null)));

    const response = await GET(new NextRequest("https://app.example.test/api/auth/realtime-token"));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ message: "Invalid realtime token response" });
  });
});
