import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "./permissions";
import { canAccessRoute, isKnownProtectedRoute } from "./route-access";
import type { SessionClaims } from "./session";

const session: SessionClaims = {
  userId: "user-id",
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: [],
  permissions: [],
  expiresAt: Date.now() + 60_000,
};

describe("route access policies", () => {
  it("recognizes unrestricted and restricted protected routes", () => {
    expect(isKnownProtectedRoute(appRoutes.home)).toBe(true);
    expect(isKnownProtectedRoute(appRoutes.basicData.countries)).toBe(true);
    expect(isKnownProtectedRoute("/not-configured")).toBe(false);
  });

  it("enforces permissions for nested routes", () => {
    expect(canAccessRoute(`${appRoutes.basicData.countries}/new`, session)).toBe(false);
    expect(canAccessRoute(`${appRoutes.basicData.countries}/new`, {
      ...session,
      permissions: [permissions.ViewCountries],
    })).toBe(true);
  });

  it("enforces administrator-only routes case-insensitively", () => {
    expect(canAccessRoute(appRoutes.advancedTools.healthCheck, session)).toBe(false);
    expect(canAccessRoute(appRoutes.advancedTools.healthCheck, {
      ...session,
      roles: ["ADMIN"],
    })).toBe(true);
  });
});
