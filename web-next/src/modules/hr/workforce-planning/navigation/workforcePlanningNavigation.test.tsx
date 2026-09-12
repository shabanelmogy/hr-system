import { describe, expect, it } from "vitest";
import type { SessionClaims } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/permissions";
import {
  getAuthorizedWorkforcePlanningNavigation,
  getWorkforcePlanningNavigation,
} from "./workforcePlanningNavigation";

function sessionWithPermissions(userPermissions: readonly string[]): SessionClaims {
  return {
    userId: "1",
    tenantId: "tenant-1",
    tenantName: "Test Tenant",
    tenantPlanName: "Professional",
    companyId: 1,
    companyCode: "COMP-1",
    companyNameAr: "الشركة الأولى",
    companyNameEn: "Company One",
    companies: [{ id: 1, companyCode: "COMP-1", nameAr: "الشركة الأولى", nameEn: "Company One" }],
    userName: "tester",
    email: "tester@example.com",
    firstName: "Test",
    lastName: "User",
    roles: [],
    permissions: [...userPermissions],
    tenantSubscriptionStatus: "active",
    tenantSubscriptionEndsOn: null,
    tenantReadOnly: false,
    expiresAt: Date.now() + 60_000,
  };
}

describe("Workforce Planning navigation permissions", () => {
  it("keeps navigation groups non-navigable", () => {
    expect(getWorkforcePlanningNavigation().map((item) => item.href)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("shows only the leaf authorized by the current view permission", () => {
    const result = getAuthorizedWorkforcePlanningNavigation(
      sessionWithPermissions([permissions.ViewStaffingRequests]),
    );

    expect(result.map((group) => group.id)).toEqual(["capacity-demand"]);
    expect(result[0]?.children?.map((item) => item.id)).toEqual(["staffing-requests"]);
  });

  it("removes every group when the user has no Workforce Planning view permission", () => {
    expect(getAuthorizedWorkforcePlanningNavigation(sessionWithPermissions([]))).toEqual([]);
  });
});
