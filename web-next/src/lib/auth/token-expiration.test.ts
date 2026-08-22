import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { shouldRefreshAccessToken } from "./token-expiration";

const now = Date.UTC(2026, 7, 22, 12, 0, 0);

describe("shouldRefreshAccessToken", () => {
  it("keeps a token that has more than one minute remaining", () => {
    const token = createToken((now + 120_000) / 1_000);
    expect(shouldRefreshAccessToken(token, now)).toBe(false);
  });

  it("refreshes an expired or nearly expired token", () => {
    expect(shouldRefreshAccessToken(createToken((now + 30_000) / 1_000), now)).toBe(true);
    expect(shouldRefreshAccessToken(createToken((now - 1_000) / 1_000), now)).toBe(true);
  });

  it("fails closed for malformed tokens", () => {
    expect(shouldRefreshAccessToken("not-a-jwt", now)).toBe(true);
  });
});

function createToken(expiresAtSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ exp: expiresAtSeconds })).toString("base64url");
  return `header.${payload}.signature`;
}
