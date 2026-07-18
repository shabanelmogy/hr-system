import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  getBackendUrl: () => "https://api.example.test",
}));

import { refreshAuthTokens, resolveSession } from "./backend-session";

const session = {
  userId: "user-id",
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: ["admin"],
  permissions: ["Users:View"],
  expiresAt: Date.now() + 60_000,
};

const refreshedAuth = {
  token: "new-access-token",
  tokenExpiration: new Date(Date.now() + 60_000).toISOString(),
  refreshToken: "new-refresh-token",
  refreshTokenExpiration: new Date(Date.now() + 86_400_000).toISOString(),
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("resolveSession", () => {
  it("returns an API-verified active session without refreshing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(session));
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveSession("access-token", "refresh-token");

    expect(result).toEqual({ status: "authenticated", session });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses API validation before reading claims during a phased backend rollout", async () => {
    const token = createValidatedToken(session);
    const fetchMock = vi.fn(async (input: string | URL | Request) =>
      input.toString().endsWith("/auth/session")
        ? jsonResponse({}, 404)
        : jsonResponse({ isAuthenticated: true }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveSession(token, "refresh-token");

    expect(result.status).toBe("authenticated");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes an expired access token before returning the session", async () => {
    const fetchMock = createRefreshFlowMock();
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveSession("expired-access-token", "refresh-token");

    expect(result).toEqual({
      status: "authenticated",
      session,
      authPayload: refreshedAuth,
    });
    expect(refreshCalls(fetchMock)).toHaveLength(1);
  });

  it("coalesces concurrent refresh attempts for the same session", async () => {
    const fetchMock = createRefreshFlowMock(20);
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      resolveSession("expired-access-token", "same-refresh-token"),
      resolveSession("expired-access-token", "same-refresh-token"),
    ]);

    expect(first.status).toBe("authenticated");
    expect(second.status).toBe("authenticated");
    expect(refreshCalls(fetchMock)).toHaveLength(1);
  });

  it("preserves rotated tokens when post-refresh verification is unavailable", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = input.toString();
      if (url.endsWith("/auth/refreshToken")) {
        return jsonResponse(refreshedAuth);
      }
      if (url.endsWith("/auth/session") && fetchMock.mock.calls.length === 1) {
        return jsonResponse({}, 401);
      }
      return jsonResponse({}, 503);
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resolveSession("expired-access-token", "rotation-test-refresh-token"),
    ).resolves.toEqual({
      status: "unavailable",
      authPayload: refreshedAuth,
    });
  });

  it("applies separate deadlines to validation and refresh requests", async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const fetchMock = createRefreshFlowMock();
    vi.stubGlobal("fetch", fetchMock);

    await resolveSession("expired-access-token", "timeout-test-refresh-token");

    expect(timeoutSpy.mock.calls).toEqual([[3_000], [5_000], [3_000]]);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.signal).toBeInstanceOf(AbortSignal);
    }
  });

  it("does not destroy the session when the authentication API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    await expect(resolveSession("access-token", "refresh-token")).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("fails closed when session validation times out", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new DOMException("The operation was aborted due to timeout", "TimeoutError"),
      ),
    );

    await expect(resolveSession("access-token")).resolves.toEqual({
      status: "unauthenticated",
    });
  });
});

describe("refreshAuthTokens", () => {
  it.each([400, 401, 403])(
    "treats status %i as a definitive credential rejection",
    async (status) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, status)));

      await expect(
        refreshAuthTokens("access-token", `rejected-refresh-${status}`),
      ).resolves.toEqual({ status: "rejected" });
    },
  );

  it.each([408, 409, 422, 429, 500, 503])(
    "treats status %i as a temporary authentication outage",
    async (status) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, status)));

      await expect(
        refreshAuthTokens("access-token", `unavailable-refresh-${status}`),
      ).resolves.toEqual({ status: "unavailable" });
    },
  );

  it("treats a refresh timeout as an expired session instead of a service outage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        new DOMException("The operation was aborted due to timeout", "TimeoutError"),
      ),
    );

    await expect(
      refreshAuthTokens("access-token", "timed-out-refresh"),
    ).resolves.toEqual({ status: "rejected" });
  });
});

function createRefreshFlowMock(delayMs = 0) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = input.toString();
    if (url.endsWith("/auth/refreshToken")) {
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
      return jsonResponse(refreshedAuth);
    }

    const authorization = new Headers(init?.headers).get("authorization");
    return authorization === "Bearer new-access-token"
      ? jsonResponse(session)
      : jsonResponse({}, 401);
  });
}

function refreshCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([input]) => input.toString().endsWith("/auth/refreshToken"));
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function createValidatedToken(value: typeof session) {
  const payload = {
    sub: value.userId,
    name: value.userName,
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    roles: value.roles,
    permissions: value.permissions,
    exp: Math.floor(value.expiresAt / 1000),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}
