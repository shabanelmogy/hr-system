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
    expect(items.find((item) => item.path === appRoutes.platform.administration.invitations)?.permissions).toEqual([permissions.ViewUserInvitations]);
    expect(items.find((item) => item.path === appRoutes.platform.settings)?.permissions).toContain(permissions.ViewOfflineOperations);
    expect(items.find((item) => item.path === appRoutes.platform.settings)?.permissions).toContain(permissions.ViewCompanyGeographicScope);
    expect(items.find((item) => item.path === appRoutes.platform.files.manager)).toBeDefined();
  });

  it("does not reclaim business-owned capabilities", () => {
    const paths = entries().map((item) => item.path);
    expect(paths).not.toContain(appRoutes.modules.reporting.crystalReports);
    expect(paths).not.toContain(appRoutes.modules.crm.appointments);
    expect(paths).not.toContain(appRoutes.modules.accounting.ledgerSetup.fiscalYears);
  });
  it("separates operational Administration from configuration without duplicating destinations", () => {
    const sections = getPlatformNavigation();
    const administration = sections.find((section) => section.title === "menu.administration");
    const settings = sections.find((section) => section.title === "menu.settings");
    expect(administration?.items?.map((item) => item.path)).toEqual(expect.arrayContaining([
      appRoutes.platform.administration.users, appRoutes.platform.administration.roles,
      appRoutes.platform.advancedTools.errorLogs, appRoutes.platform.advancedTools.auditTrail,
      appRoutes.platform.advancedTools.hangfireDashboard,
    ]));
    expect(settings).toBeUndefined();
    expect(administration?.items?.filter((item) => item.path === appRoutes.platform.settings)).toHaveLength(1);
    expect(entries().some((item) => item.path === appRoutes.platform.administration.companyLocalizations)).toBe(false);
    const allPaths = entries().map((item) => item.path);
    expect(new Set(allPaths).size).toBe(allPaths.length);
    expect(sections.some((section) => section.id === "platform-advanced-tools")).toBe(false);
  });
});
