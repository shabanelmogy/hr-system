import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "./permissions";
import { canAccessRoute, routePolicies } from "./route-access";
import type { SessionClaims } from "./session";

const session: SessionClaims = {
  userId: "user-id",
  tenantId: "tenant-id",
  tenantName: "Test Tenant",
  tenantPlanName: "Professional",
  companyId: 7,
  companyCode: "COMP-7",
  companyNameAr: "الشركة السابعة",
  companyNameEn: "Company Seven",
  companies: [{ id: 7, companyCode: "COMP-7", nameAr: "الشركة السابعة", nameEn: "Company Seven" }],
  userName: "user",
  email: "user@example.com",
  firstName: "Test",
  lastName: "User",
  roles: [],
  permissions: [],
  tenantSubscriptionStatus: "active",
  tenantSubscriptionEndsOn: null,
  tenantReadOnly: false,
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

  it("requires ViewUsers for the invitations administration page", () => {
    expect(canAccessRoute(appRoutes.auth.invitationsPage, session)).toBe(false);
    expect(canAccessRoute(appRoutes.auth.invitationsPage, {
      ...session,
      permissions: [permissions.ViewUsers],
    })).toBe(true);
  });

  it("requires report-management access for the Crystal Report Manager", () => {
    expect(canAccessRoute(appRoutes.auth.crystalReportsPage, session)).toBe(false);
    expect(canAccessRoute(appRoutes.auth.crystalReportsPage, {
      ...session,
      permissions: [permissions.ManageCrystalReportAccess],
    })).toBe(true);
  });

  it("allows the Basic Data workspace for any Basic Data view permission", () => {
    expect(canAccessRoute(appRoutes.basicData.index, session)).toBe(false);
    expect(canAccessRoute(appRoutes.basicData.index, {
      ...session,
      permissions: [permissions.ViewStates],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.basicData.countries, {
      ...session,
      permissions: [permissions.ViewStates],
    })).toBe(false);
  });

  it("enforces administrator-only routes case-insensitively", () => {
    expect(canAccessRoute(appRoutes.advancedTools.healthCheck, session)).toBe(false);
    expect(canAccessRoute(appRoutes.advancedTools.healthCheck, {
      ...session,
      roles: ["ADMIN"],
    })).toBe(true);
  });

  it("allows Hangfire access through an assignable permission", () => {
    expect(canAccessRoute(appRoutes.advancedTools.hangfireDashboard, session)).toBe(false);
    expect(canAccessRoute(appRoutes.advancedTools.hangfireDashboard, {
      ...session,
      permissions: [permissions.ViewHangfireDashboard],
    })).toBe(true);
    expect(canAccessRoute("/hangfire/jobs/enqueued", {
      ...session,
      permissions: [permissions.ViewHangfireDashboard],
    })).toBe(true);
  });

  it("covers every registered page policy", () => {
    for (const policy of routePolicies) {
      const authorizedSession = {
        ...session,
        roles: policy.roles ? [...policy.roles] : [],
        permissions: policy.permissions ? [...policy.permissions] : [],
      };

      expect(canAccessRoute(policy.path, authorizedSession)).toBe(true);

      if (policy.roles || policy.permissions) {
        expect(canAccessRoute(policy.path, session)).toBe(false);
      }
    }
  });
});
