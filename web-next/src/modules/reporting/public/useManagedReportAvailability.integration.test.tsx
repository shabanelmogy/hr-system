import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorizationOptions: [] as Record<string, unknown>[],
  moduleEnabled: [] as boolean[],
}));

vi.mock("@/lib/auth/useAuthorization", () => ({
  useAuthorization: (options: Record<string, unknown>) => {
    mocks.authorizationOptions.push(options);
    return { allowed: true, isLoading: false };
  },
}));

vi.mock("@/platform/modules", () => ({
  useAccessibleModulesQuery: (enabled: boolean) => {
    mocks.moduleEnabled.push(enabled);
    return { data: [{ code: "reporting" }], isLoading: false };
  },
}));

import { useManagedReportAvailability } from "./useManagedReportAvailability";

function Probe({ scope }: { scope: "global" | "tenant" }) {
  const availability = useManagedReportAvailability(scope);
  return <output>{String(availability.allowed)}</output>;
}

describe("useManagedReportAvailability query boundary", () => {
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
});
