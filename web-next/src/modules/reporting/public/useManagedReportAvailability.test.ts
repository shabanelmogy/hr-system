import { describe, expect, it } from "vitest";
import { isAuthorized } from "@/lib/auth/authorization";
import {
  getManagedReportAuthorization,
  resolveManagedReportAvailability,
} from "./useManagedReportAvailability";

describe("managed report authorization policy", () => {
  it("requires super_admin and the global permission without tenant entitlement input", () => {
    expect(getManagedReportAuthorization("global")).toEqual({
      allowedRoles: ["super_admin"],
      requiredPermissions: ["GlobalCrystalReports:View"],
    });
    expect(resolveManagedReportAvailability("global", {
      authorizationAllowed: true,
      authorizationLoading: false,
      modulesLoading: true,
      reportingAccessible: false,
    })).toEqual({ allowed: true, isLoading: false });
  });

  it("requires the tenant permission and accessible Reporting module", () => {
    expect(getManagedReportAuthorization("tenant")).toEqual({
      allowedRoles: undefined,
      requiredPermissions: ["CrystalReports:View"],
    });
    expect(resolveManagedReportAvailability("tenant", {
      authorizationAllowed: true,
      authorizationLoading: false,
      modulesLoading: true,
      reportingAccessible: false,
    })).toEqual({ allowed: false, isLoading: true });
    expect(resolveManagedReportAvailability("tenant", {
      authorizationAllowed: true,
      authorizationLoading: false,
      modulesLoading: false,
      reportingAccessible: true,
    })).toEqual({ allowed: true, isLoading: false });
  });

  it("uses the case-insensitive super_admin role together with the global permission", () => {
    const requirement = getManagedReportAuthorization("global");

    expect(isAuthorized(
      { roles: ["SUPER_ADMIN"], permissions: ["GlobalCrystalReports:View"] },
      {
        roles: requirement.allowedRoles,
        permissions: requirement.requiredPermissions,
      },
    )).toBe(true);
    expect(isAuthorized(
      { roles: ["SUPER_ADMIN"], permissions: [] },
      {
        roles: requirement.allowedRoles,
        permissions: requirement.requiredPermissions,
      },
    )).toBe(false);
    expect(isAuthorized(
      { roles: ["admin"], permissions: ["GlobalCrystalReports:View"] },
      {
        roles: requirement.allowedRoles,
        permissions: requirement.requiredPermissions,
      },
    )).toBe(false);
  });
});
