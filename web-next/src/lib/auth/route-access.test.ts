import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "./permissions";
import { canAccessRoute } from "./route-access";
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
  it("allows registered unrestricted routes and denies unknown routes", () => {
    expect(canAccessRoute(appRoutes.home, session)).toBe(true);
    expect(canAccessRoute("/not-configured", session)).toBe(false);
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
