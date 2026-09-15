import { describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { getPlatformNavigation } from "./platformNavigation";

const entries = () => getPlatformNavigation().flatMap((section) => section.items ?? []);

describe("Platform internal navigation", () => {
  it("keeps Platform operations outside business module ownership", () => {
    const items = entries();
    expect(items.find((item) => item.path === appRoutes.auth.rolesPage)?.permissions).toEqual([permissions.ViewRoles]);
    expect(items.find((item) => item.path === appRoutes.auth.usersPage)?.permissions).toEqual([permissions.ViewUsers]);
    expect(items.find((item) => item.path === appRoutes.auth.offlineOperationsPage)?.permissions).toBeUndefined();
    expect(items.find((item) => item.path === appRoutes.basicData.companyGeographicScope)?.permissions).toEqual([permissions.ViewCompanyGeographicScope]);
    expect(items.find((item) => item.path === appRoutes.extras.filesManager)).toBeDefined();
  });

  it("does not reclaim business-owned capabilities", () => {
    const paths = entries().map((item) => item.path);
    expect(paths).not.toContain(appRoutes.auth.crystalReportsPage);
    expect(paths).not.toContain(appRoutes.extras.appointments);
    expect(paths).not.toContain(appRoutes.finance.fiscalYears);
  });
});
