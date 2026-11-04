import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorizationOptions: [] as Record<string, unknown>[],
  moduleEnabled: [] as boolean[],
  platformAllowed: true,
  companyAllowed: true,
  reportingAccessible: true,
  user: null as { userId: string; tenantId: string | null; companyId: number; roles: string[] } | null,
}));

vi.mock("@/lib/auth/useAuthorization", () => ({
  useAuthorization: (options: Record<string, unknown>) => {
    mocks.authorizationOptions.push(options);
    return { allowed: options.permissionMode === "all" ? mocks.companyAllowed : mocks.platformAllowed, isLoading: false };
  },
}));

vi.mock("@/platform/modules", () => ({
  useAccessibleModulesQuery: (enabled: boolean) => {
    mocks.moduleEnabled.push(enabled);
    return { data: mocks.reportingAccessible ? [{ code: "reporting" }] : [], isLoading: false };
  },
}));
vi.mock("@/lib/auth/SessionContext", () => ({ useSession: () => ({ user: mocks.user }) }));

import { useManagedReportAvailability } from "./useManagedReportAvailability";

function Probe({ scope }: { scope: "global" | "tenant" }) {
  const availability = useManagedReportAvailability(scope, "countries");
  return <output>{String(availability.allowed)}</output>;
}

describe("useManagedReportAvailability query boundary", () => {
  beforeEach(() => {
    mocks.authorizationOptions.length = 0;
    mocks.moduleEnabled.length = 0;
    mocks.platformAllowed = true;
    mocks.companyAllowed = true;
    mocks.reportingAccessible = true;
    mocks.user = null;
  });
  it("does not enable the tenant-module query for an allowed global user", () => {
    mocks.authorizationOptions.length = 0;
    mocks.moduleEnabled.length = 0;

    expect(renderToStaticMarkup(<Probe scope="global" />)).toContain("true");
    expect(mocks.authorizationOptions[0]).toEqual({
      allowedRoles: ["super_admin"],
      requiredPermissions: ["GlobalCrystalReports:View"],
    });
    expect(mocks.moduleEnabled).toEqual([false]);
  });

  it("enables the accessible-module query only for an authorized tenant user", () => {
    mocks.authorizationOptions.length = 0;
    mocks.moduleEnabled.length = 0;

    expect(renderToStaticMarkup(<Probe scope="tenant" />)).toContain("true");
    expect(mocks.authorizationOptions[0]).toEqual({
      allowedRoles: undefined,
      requiredPermissions: ["CrystalReports:View"],
    });
    expect(mocks.moduleEnabled).toEqual([true]);
  });
  it("requires the company module entitlement and both report and entity permissions", () => {
    mocks.platformAllowed = false;
    mocks.user = { userId: "user-a", tenantId: "tenant-a", companyId: 1, roles: ["employee"] };
    expect(renderToStaticMarkup(<Probe scope="global" />)).toContain("true");
    expect(mocks.authorizationOptions[1]).toEqual({ requiredPermissions: ["CrystalReports:View", "Countries:View"], permissionMode: "all" });
    expect(mocks.moduleEnabled).toEqual([true]);
    mocks.reportingAccessible = false;
    expect(renderToStaticMarkup(<Probe scope="global" />)).toContain("false");
    mocks.reportingAccessible = true;
    mocks.companyAllowed = false;
    expect(renderToStaticMarkup(<Probe scope="global" />)).toContain("false");
  });
  it("does not downgrade a super admin without global permission into company access", () => {
    mocks.platformAllowed = false;
    mocks.user = { userId: "user-a", tenantId: "tenant-a", companyId: 1, roles: ["super_admin"] };
    expect(renderToStaticMarkup(<Probe scope="global" />)).toContain("false");
    expect(mocks.moduleEnabled).toEqual([false]);
  });
});
