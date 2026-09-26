import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "./permissions";
import {
  canAccessRoute,
  routePolicies,
} from "./route-access";
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
    expect(canAccessRoute(appRoutes.shell.home, session)).toBe(true);
    expect(canAccessRoute("/not-configured", session)).toBe(false);
  });

  it("fails closed for removed legacy tenant geography URLs", () => {
    const tenantCatalogSession = {
      ...session,
      roles: ["admin"],
      permissions: [permissions.ViewCountries, permissions.ViewStates, permissions.ViewDistricts],
    };

    expect(canAccessRoute("/basic-data/countries", tenantCatalogSession)).toBe(false);
    expect(canAccessRoute("/basic-data/countries/new", tenantCatalogSession)).toBe(false);
    expect(canAccessRoute("/basic-data/states", tenantCatalogSession)).toBe(false);
    expect(canAccessRoute("/basic-data/districts", tenantCatalogSession)).toBe(false);
    expect(canAccessRoute("/basic-data/country-report", tenantCatalogSession)).toBe(false);
    expect(canAccessRoute("/basic-data/global-presence", tenantCatalogSession)).toBe(false);
  });

  it("requires both Super Admin and the exact global geography permission", () => {
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.countries, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.states, {
      ...session,
      roles: ["SUPER_ADMIN"],
    })).toBe(false);
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.districts, {
      ...session,
      permissions: [permissions.ViewDistricts],
    })).toBe(false);
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.countries, {
      ...session,
      roles: ["super_admin"],
      permissions: [permissions.ViewCountries],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.states, {
      ...session,
      roles: ["super_admin"],
      permissions: [permissions.ViewStates],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.modules.referenceData.geography.districts, {
      ...session,
      roles: ["super_admin"],
      permissions: [permissions.ViewDistricts],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.platform.apps.index, {
      ...session,
      roles: ["super_admin"],
    })).toBe(false);
  });

  it("requires ViewUsers for the invitations administration page", () => {
    expect(canAccessRoute(appRoutes.platform.administration.invitations, session)).toBe(false);
    expect(canAccessRoute(appRoutes.platform.administration.invitations, {
      ...session,
      permissions: [permissions.ViewUsers],
    })).toBe(true);
  });

  it("requires report-management access for the Crystal Report Manager", () => {
    expect(canAccessRoute(appRoutes.modules.reporting.crystalReports, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.reporting.crystalReports, {
      ...session,
      permissions: [permissions.ViewCrystalReports],
    })).toBe(true);
  });

  it("allows the Basic Data workspace for any Basic Data view permission", () => {
    expect(canAccessRoute(appRoutes.shell.basicData, session)).toBe(false);
    expect(canAccessRoute(appRoutes.shell.basicData, {
      ...session,
      permissions: [permissions.ViewCompanyGeographicScope],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.platform.companyGeographicScope, {
      ...session,
      permissions: [permissions.ViewCompanyGeographicScope],
    })).toBe(true);
  });

  it("enforces administrator-only routes case-insensitively", () => {
    expect(canAccessRoute(appRoutes.platform.advancedTools.healthCheck, session)).toBe(false);
    expect(canAccessRoute(appRoutes.platform.advancedTools.healthCheck, {
      ...session,
      roles: ["ADMIN"],
    })).toBe(true);
  });

  it("allows Hangfire access through an assignable permission", () => {
    expect(canAccessRoute(appRoutes.platform.advancedTools.hangfireDashboard, session)).toBe(false);
    expect(canAccessRoute(appRoutes.platform.advancedTools.hangfireDashboard, {
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
      const firstReq = policy.anyOf?.[0];
      const authorizedSession = {
        ...session,
        roles: policy.roles ? [...policy.roles] : firstReq?.roles ? [...firstReq.roles] : [],
        permissions: policy.permissions ? [...policy.permissions] : firstReq?.permissions ? [...firstReq.permissions] : [],
      };

      expect(canAccessRoute(policy.path, authorizedSession)).toBe(true);

      if (policy.roles || policy.permissions || policy.anyOf) {
        expect(canAccessRoute(policy.path, session)).toBe(false);
      }
    }
  });

  it("allows recruitment access to admin or users with ViewRecruitment", () => {
    expect(canAccessRoute(appRoutes.modules.hr.recruitment, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.hr.recruitment, {
      ...session,
      roles: ["admin"],
    })).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.recruitment, {
      ...session,
      permissions: [permissions.ViewRecruitment],
    })).toBe(true);
  });

  it("matches the Platform file API tenant-member access model", () => {
    expect(canAccessRoute(appRoutes.platform.files.manager, session)).toBe(true);
  });

  it("requires ViewRaw for attendance raw-data screens", () => {
    const deviceViewer = {
      ...session,
      permissions: [permissions.ViewAttendanceDevices],
    };
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.index, deviceViewer)).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.users, deviceViewer)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.punches, deviceViewer)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.pullRuns, deviceViewer)).toBe(false);

    const rawViewer = {
      ...session,
      permissions: [permissions.ViewRawAttendanceDevices],
    };
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.users, rawViewer)).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.punches, rawViewer)).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.attendanceDevices.pullRuns, rawViewer)).toBe(true);
  });

  it("allows tenant members to read offline operations policy without manage permission", () => {
    expect(canAccessRoute(appRoutes.platform.administration.offlineOperations, session)).toBe(true);
  });

  it("requires FiscalYears:View for the Ledger Setup fiscal-years route", () => {
    expect(canAccessRoute(appRoutes.modules.accounting.ledgerSetup.fiscalYears, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.accounting.ledgerSetup.fiscalYears, {
      ...session,
      permissions: [permissions.ViewFiscalYears],
    })).toBe(true);
  });

  it("requires AccountingSetup:View for the Ledger Setup currencies route", () => {
    expect(canAccessRoute(appRoutes.modules.accounting.ledgerSetup.currencies, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.accounting.ledgerSetup.currencies, {
      ...session,
      permissions: [permissions.ViewCurrencies],
    })).toBe(true);
  });

  it("allows the Workforce Planning workspace for any module view permission", () => {
    const staffingViewer = {
      ...session,
      permissions: [permissions.ViewStaffingRequests],
    };

    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.index, session)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.index, staffingViewer)).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.staffingRequests, staffingViewer)).toBe(true);
  });

  it("keeps Workforce Planning leaf permissions isolated", () => {
    const planViewer = {
      ...session,
      permissions: [permissions.ViewWorkforcePlans],
    };

    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.plans, planViewer)).toBe(true);
    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.budgets, planViewer)).toBe(false);
    expect(canAccessRoute(appRoutes.modules.hr.workforcePlanning.trace, planViewer)).toBe(false);
  });
});
