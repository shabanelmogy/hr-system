import { describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { getPlatformNavigation } from "./platformNavigation";

const entries = () => getPlatformNavigation().flatMap((section) => section.items ?? []);

describe("Platform internal navigation", () => {
  it("keeps Platform operations outside business module ownership", () => {
    const items = entries();
    expect(items.find((item) => item.path === appRoutes.platform.administration.roles)?.permissions).toEqual([permissions.ViewRoles]);
    expect(items.find((item) => item.path === appRoutes.platform.administration.users)?.permissions).toEqual([permissions.ViewUsers]);
    expect(items.find((item) => item.path === appRoutes.platform.administration.offlineOperations)?.permissions).toBeUndefined();
    expect(items.find((item) => item.path === appRoutes.platform.companyGeographicScope)?.permissions).toEqual([permissions.ViewCompanyGeographicScope]);
    expect(items.find((item) => item.path === appRoutes.platform.files.manager)).toBeDefined();
  });

  it("does not reclaim business-owned capabilities", () => {
    const paths = entries().map((item) => item.path);
    expect(paths).not.toContain(appRoutes.modules.reporting.crystalReports);
    expect(paths).not.toContain(appRoutes.modules.crm.appointments);
    expect(paths).not.toContain(appRoutes.modules.accounting.ledgerSetup.fiscalYears);
  });
});
