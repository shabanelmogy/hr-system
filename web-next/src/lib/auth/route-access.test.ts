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

  it("keeps legacy tenant geography management routes unavailable", () => {
    const tenantCatalogSession = {
      ...session,
      roles: ["admin"],
      permissions: [
        permissions.ViewCountries,
        permissions.ViewStates,
        permissions.ViewDistricts,
      ],
    };

    expect(canAccessRoute(appRoutes.basicData.countries, tenantCatalogSession)).toBe(false);
    expect(canAccessRoute(`${appRoutes.basicData.countries}/new`, tenantCatalogSession)).toBe(false);
    expect(canAccessRoute(appRoutes.basicData.states, tenantCatalogSession)).toBe(false);
    expect(canAccessRoute(appRoutes.basicData.districts, tenantCatalogSession)).toBe(false);
  });

  it("allows only Super Admin to access global geography management", () => {
    expect(canAccessRoute(appRoutes.superAdmin.geography.countries, session)).toBe(false);
    expect(canAccessRoute(appRoutes.superAdmin.geography.states, {
      ...session,
      roles: ["SUPER_ADMIN"],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.superAdmin.geography.districts, {
      ...session,
      roles: ["super_admin"],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.basicData.countries, {
      ...session,
      roles: ["super_admin"],
      permissions: [permissions.ViewCountries],
    })).toBe(false);
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
      permissions: [permissions.ViewCompanyGeographicScope],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.basicData.companyGeographicScope, {
      ...session,
      permissions: [permissions.ViewCompanyGeographicScope],
    })).toBe(true);
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
    for (const policy of routePolicies.filter((policy) => !policy.deny)) {
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
