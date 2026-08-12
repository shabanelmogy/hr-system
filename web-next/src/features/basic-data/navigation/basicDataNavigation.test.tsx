import { describe, expect, it } from "vitest";
import type { SessionClaims } from "@/lib/auth/session";
import { permissions } from "@/lib/auth/permissions";
import { getAuthorizedBasicDataNavigation } from "./basicDataNavigation";

function sessionWithPermissions(userPermissions: readonly string[]): SessionClaims {
  return {
    userId: "1",
    tenantId: "tenant-1",
    tenantName: "Test Tenant",
    tenantPlanName: "Professional",
    companyId: 1,
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
  it("keeps only permitted children", () => {
    const result = getAuthorizedBasicDataNavigation(
      sessionWithPermissions([permissions.ViewStates]),
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.children?.map((item) => item.id)).toEqual(["states"]);
  });

  it("removes groups that have no permitted children", () => {
    expect(getAuthorizedBasicDataNavigation(sessionWithPermissions([]))).toEqual([]);
  });
});
