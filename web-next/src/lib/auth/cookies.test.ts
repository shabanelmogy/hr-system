import { describe, expect, it, vi } from "vitest";
import { isAuthPayload, readAuthTokens } from "./cookies";

describe("isAuthPayload", () => {
  it("accepts non-empty tokens with valid expirations", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    expect(isAuthPayload({
      token: "access-token",
      refreshToken: "refresh-token",
      tokenExpiration: "2026-01-01T00:05:00.000Z",
      refreshTokenExpiration: "2026-01-02T00:00:00.000Z",
    })).toBe(true);

    vi.useRealTimers();
  });

  it("rejects empty tokens", () => {
    expect(isAuthPayload({ token: " ", refreshToken: "refresh-token" })).toBe(false);
    expect(isAuthPayload({ token: "access-token", refreshToken: "" })).toBe(false);
  });

  it("rejects malformed or expired supplied expirations", () => {
    expect(isAuthPayload({
      token: "access-token",
      refreshToken: "refresh-token",
      tokenExpiration: "not-a-date",
    })).toBe(false);
    expect(isAuthPayload({
      token: "access-token",
      refreshToken: "refresh-token",
      refreshTokenExpiration: new Date(Date.now() - 1).toISOString(),
    })).toBe(false);
  });
});

describe("readAuthTokens", () => {
  it("migrates a legacy token pair to the current cookie names", () => {
    const source = new Map([
      ["hrms_access_token", "legacy-access"],
      ["hrms_refresh_token", "legacy-refresh"],
    ]);

    expect(readAuthTokens({ get: (name) => {
      const value = source.get(name);
      return value ? { value } : undefined;
    } })).toEqual({
      accessToken: "legacy-access",
      refreshToken: "legacy-refresh",
      migrationPayload: {
        token: "legacy-access",
        refreshToken: "legacy-refresh",
      },
    });
  });

  it("prefers current cookies and does not create a migration payload", () => {
    const source = new Map([
      ["__Host-hrms-access-token", "current-access"],
      ["__Host-hrms-refresh-token", "current-refresh"],
      ["hrms_access_token", "legacy-access"],
      ["hrms_refresh_token", "legacy-refresh"],
    ]);

    expect(readAuthTokens({ get: (name) => {
      const value = source.get(name);
      return value ? { value } : undefined;
    } })).toEqual({
      accessToken: "current-access",
      refreshToken: "current-refresh",
      migrationPayload: undefined,
    });
  });
});
