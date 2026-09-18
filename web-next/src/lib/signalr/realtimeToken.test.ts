import { describe, expect, it } from "vitest";
import { getJwtExpiration, parseRealtimeTokenPayload } from "./realtimeToken";

describe("realtime token runtime parsing", () => {
  it("accepts only a non-empty token string", () => {
    expect(parseRealtimeTokenPayload({ token: "signed-token" })).toBe("signed-token");
    expect(parseRealtimeTokenPayload({ token: "" })).toBeNull();
    expect(parseRealtimeTokenPayload({ token: 42 })).toBeNull();
    expect(parseRealtimeTokenPayload(null)).toBeNull();
  });

  it("reads a finite JWT expiration without trusting decoded JSON", () => {
    const payload = Buffer.from(JSON.stringify({ exp: 1_800_000_000 })).toString("base64url");
    expect(getJwtExpiration(`header.${payload}.signature`)).toBe(1_800_000_000_000);

    const invalid = Buffer.from(JSON.stringify({ exp: "tomorrow" })).toString("base64url");
    expect(getJwtExpiration(`header.${invalid}.signature`)).toBe(0);
    expect(getJwtExpiration("not-a-jwt")).toBe(0);
  });
});
