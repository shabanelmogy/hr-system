import { describe, expect, it } from "vitest";
import { isSessionClaims } from "./session";

const validSession = {
  userId: "user-id",
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: ["admin"],
  permissions: ["Users:View"],
  expiresAt: Date.now() + 60_000,
};

describe("isSessionClaims", () => {
  it("accepts a complete verified session response", () => {
    expect(isSessionClaims(validSession)).toBe(true);
  });

  it("rejects malformed role and permission claims", () => {
    expect(isSessionClaims({ ...validSession, roles: "admin" })).toBe(false);
    expect(isSessionClaims({ ...validSession, permissions: [123] })).toBe(false);
  });

  it("rejects expired sessions", () => {
    expect(isSessionClaims({ ...validSession, expiresAt: Date.now() - 1 })).toBe(false);
  });
});
