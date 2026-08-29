import { describe, expect, it } from "vitest";
import type { SessionClaims } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/permissions";
import { getAuthorizedBasicDataNavigation, getBasicDataNavigation } from "./basicDataNavigation";

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

describe("Basic Data navigation permissions", () => {
  it("keeps group items non-navigable so only the active leaf is selected", () => {
    const result = getBasicDataNavigation();

    expect(result.map((item) => item.href)).toEqual([undefined, undefined]);
  });

  it("keeps only permitted children", () => {
    const result = getAuthorizedBasicDataNavigation(
      sessionWithPermissions([permissions.ViewCompanyGeographicScope]),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.children?.map((item) => item.id)).toEqual([
      "company-geographic-scope",
    ]);
  });

  it("removes groups that have no permitted children", () => {
    expect(getAuthorizedBasicDataNavigation(sessionWithPermissions([]))).toEqual([]);
  });
});
