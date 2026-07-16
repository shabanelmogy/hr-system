import { describe, expect, it } from "vitest";
import { permissions } from "./permissions";
import type { SessionClaims } from "./session";
import { getAuthorizationState, isAuthorized } from "./authorization";

const session: SessionClaims = {
  userId: "user-id",
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: ["Manager"],
  permissions: [permissions.ViewUsers, permissions.EditUsers],
  expiresAt: Date.now() + 60_000,
};

describe("authorization policy", () => {
  it("allows authenticated users when no restriction is configured", () => {
    expect(isAuthorized(session)).toBe(true);
  });

  it("matches roles case-insensitively", () => {
    expect(isAuthorized(session, { roles: ["manager"] })).toBe(true);
    expect(isAuthorized(session, { roles: ["admin"] })).toBe(false);
  });

  it("supports any and all permission modes", () => {
    const required = [permissions.ViewUsers, permissions.DeleteUsers];

    expect(isAuthorized(session, { permissions: required })).toBe(true);
    expect(
      isAuthorized(session, { permissions: required, permissionMode: "all" }),
    ).toBe(false);
    expect(
      isAuthorized(session, {
        permissions: [permissions.ViewUsers, permissions.EditUsers],
        permissionMode: "all",
      }),
    ).toBe(true);
  });

  it("requires both role and permission restrictions when both are present", () => {
    expect(
      isAuthorized(session, {
        roles: ["manager"],
        permissions: [permissions.ViewUsers],
      }),
    ).toBe(true);
    expect(
      isAuthorized(session, {
        roles: ["admin"],
        permissions: [permissions.ViewUsers],
      }),
    ).toBe(false);
  });

  it("distinguishes loading, unauthenticated, forbidden, and authorized states", () => {
    expect(getAuthorizationState(null, true)).toBe("loading");
    expect(getAuthorizationState(null, false)).toBe("unauthenticated");
    expect(
      getAuthorizationState(session, true, { roles: ["manager"] }),
    ).toBe("authorized");
    expect(
      getAuthorizationState(session, false, { roles: ["admin"] }),
    ).toBe("forbidden");
  });
});
