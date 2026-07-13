import { describe, expect, it, vi } from "vitest";
import { isAuthPayload } from "./cookies";

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
