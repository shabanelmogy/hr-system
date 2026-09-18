import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { resolveSessionMock, setAuthCookiesMock, annotateScopeMock } = vi.hoisted(() => ({
  resolveSessionMock: vi.fn(),
  setAuthCookiesMock: vi.fn(),
  annotateScopeMock: vi.fn(),
}));

vi.mock("@/lib/auth/backend-session", () => ({ resolveSession: resolveSessionMock }));
vi.mock("@/lib/auth/cookies", () => ({
  readAuthTokens: () => ({ accessToken: "access", refreshToken: "refresh" }),
  setAuthCookies: setAuthCookiesMock,
}));
vi.mock("@/lib/env/server", () => ({
  resolveRequestBackendUrl: () => "https://api.example.test",
}));
vi.mock("@/lib/observability/serverTelemetry", () => ({
  annotateActiveVerifiedSessionScope: annotateScopeMock,
}));

import { GET } from "./route";

const verifiedSession = { userId: "user-1", tenantId: "tenant-1", companyId: 7 };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("session BFF route", () => {
  it("returns a verified session without exposing backend auth payloads", async () => {
    resolveSessionMock.mockResolvedValue({ status: "authenticated", session: verifiedSession });

    const response = await GET(new NextRequest("https://app.example.test/api/auth/session"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ isAuthenticated: true, user: verifiedSession });
    expect(annotateScopeMock).toHaveBeenCalledWith(verifiedSession);
  });

  it("maps unauthenticated and unavailable auth states deterministically", async () => {
    resolveSessionMock.mockResolvedValueOnce({ status: "unauthenticated" });
    const unauthorized = await GET(new NextRequest("https://app.example.test/api/auth/session"));
    expect(unauthorized.status).toBe(401);

    const refreshedPayload = { token: "new-access", refreshToken: "new-refresh" };
    resolveSessionMock.mockResolvedValueOnce({ status: "unavailable", authPayload: refreshedPayload });
    const unavailable = await GET(new NextRequest("https://app.example.test/api/auth/session"));
    expect(unavailable.status).toBe(503);
    expect(setAuthCookiesMock).toHaveBeenCalledWith(unavailable, refreshedPayload);
  });
});
