import { describe, expect, it, vi } from "vitest";
import { permissions } from "@/lib/auth/permissions";
import { appRoutes } from "@/config/routes";
import { getSuperAdminConfig, getSuperAdminAdministrationConfig } from "./superAdminConfig";
import { filterNavigationConfig } from "../navigationUtils";
vi.mock("@/platform/modules", () => ({ canAccessPathByModules: () => true }));
describe("Settings inside Administration", () => {
  it("admits Settings independently of the error viewer", () => {
    const sections = filterNavigationConfig([getSuperAdminAdministrationConfig()], ["super_admin"], [permissions.ViewErrorLogSettings]);
    expect(sections[0].title).toBe("menu.administration");
    expect(sections[0].items?.map((item) => item.path)).toEqual([appRoutes.platform.settings]);
  });
  it("retains the viewer without granting Settings and hides empty groups", () => {
    const section = filterNavigationConfig([getSuperAdminAdministrationConfig()], ["super_admin"], [permissions.ViewSystemErrorLogs])[0];
    expect(section.items?.map((item) => item.path)).toEqual([appRoutes.platform.superAdmin.errorLogs]);
    expect(filterNavigationConfig([getSuperAdminAdministrationConfig()], ["super_admin"], [])).toEqual([]);
    expect(filterNavigationConfig([getSuperAdminAdministrationConfig()], ["admin"], [permissions.ViewErrorLogSettings])).toEqual([]);
  });
  it("keeps each global tool independent and never adds company administration", () => {
    const section = filterNavigationConfig([getSuperAdminAdministrationConfig()], ["super_admin"], [permissions.ViewSystemHealth, permissions.ViewSystemAuditTrail])[0];
    expect(section.items?.map(item => item.path)).toEqual([appRoutes.platform.superAdmin.auditTrail, appRoutes.platform.advancedTools.healthCheck]);
  });
  it("has no top-level Settings or duplicate system viewer", () => {
    const config = [getSuperAdminConfig(), getSuperAdminAdministrationConfig()];
    expect(config.some((section) => section.title === "menu.settings")).toBe(false);
    expect(config[0].items?.some((item) => item.path === appRoutes.platform.superAdmin.errorLogs)).toBe(false);
  });
});
