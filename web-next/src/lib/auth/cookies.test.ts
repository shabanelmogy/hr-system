import { describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  isAuthPayload,
  readAuthTokens,
  setAuthCookies,
} from "./cookies";

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

  it("reassembles a chunked access token", () => {
    const source = new Map([
      ["__Host-hrms-access-token", "chunks-2"],
      ["__Host-hrms-access-token.0", "first-part-"],
      ["__Host-hrms-access-token.1", "second-part"],
      ["__Host-hrms-refresh-token", "current-refresh"],
    ]);

    expect(readAuthTokens({ get: (name) => {
      const value = source.get(name);
      return value ? { value } : undefined;
    } })).toEqual({
      accessToken: "first-part-second-part",
      refreshToken: "current-refresh",
      migrationPayload: undefined,
    });
  });

  it("fails closed when a declared access-token chunk is missing", () => {
    const source = new Map([
      ["__Host-hrms-access-token", "chunks-2"],
      ["__Host-hrms-access-token.0", "first-part"],
      ["__Host-hrms-refresh-token", "current-refresh"],
    ]);

    expect(readAuthTokens({ get: (name) => {
      const value = source.get(name);
      return value ? { value } : undefined;
    } })).toEqual({
      accessToken: undefined,
      refreshToken: "current-refresh",
      migrationPayload: undefined,
    });
  });
});

describe("auth cookie writes", () => {
  it("splits a large access token into browser-safe cookies", () => {
    const response = NextResponse.json({});
    const accessToken = "a".repeat(6_005);

    setAuthCookies(response, {
      token: accessToken,
      refreshToken: "refresh-token",
    });

    expect(response.cookies.get("__Host-hrms-access-token")?.value).toBe("chunks-3");
    expect(response.cookies.get("__Host-hrms-access-token.0")?.value).toHaveLength(3_000);
    expect(response.cookies.get("__Host-hrms-access-token.1")?.value).toHaveLength(3_000);
    expect(response.cookies.get("__Host-hrms-access-token.2")?.value).toHaveLength(5);

    const tokens = readAuthTokens(response.cookies);
    expect(tokens.accessToken).toBe(accessToken);
    expect(tokens.refreshToken).toBe("refresh-token");
  });

  it("clears every possible access-token chunk on logout", () => {
    const response = NextResponse.json({});

    clearAuthCookies(response);

    expect(response.cookies.get("__Host-hrms-access-token")?.value).toBe("");
    expect(response.cookies.get("__Host-hrms-access-token.0")?.value).toBe("");
    expect(response.cookies.get("__Host-hrms-access-token.7")?.value).toBe("");
  });
});
