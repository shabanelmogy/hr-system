import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { getAdministrationModule, isAdministrationPath } from "./tenantAdministrationLauncher";

const translate = (key: string) => key;
describe("Administration application composition", () => {
  it("omits the application when no administrative destination is allowed", () => {
    expect(getAdministrationModule(() => false, translate)).toBeNull();
  });
  it("groups only permitted destinations and keeps languages inside Settings", () => {
    const allowed = [appRoutes.platform.administration.users, appRoutes.platform.settings,
      appRoutes.platform.advancedTools.errorLogs];
    const application = getAdministrationModule(path => allowed.includes(path as typeof allowed[number]), translate);
    expect(application?.code).toBe("administration");
    expect(application?.submodules.map(item => item.entryPath).sort()).toEqual([...allowed].sort());
    expect(application?.submodules.some(item => item.entryPath === appRoutes.platform.administration.roles)).toBe(false);
    expect(application?.submodules.some(item => item.entryPath === appRoutes.platform.administration.companyLocalizations)).toBe(false);
  });
  it("recomputes children after permission/company changes without retaining old grants", () => {
    const first = getAdministrationModule(path => path === appRoutes.platform.administration.roles, translate);
    const second = getAdministrationModule(path => path === appRoutes.platform.settings, translate);
    expect(first?.submodules).toHaveLength(1);
    expect(second?.submodules).toHaveLength(1);
    expect(second?.submodules[0].entryPath).toBe(appRoutes.platform.settings);
    expect(first?.submodules[0].entryPath).toBe(appRoutes.platform.administration.roles);
  });
  it("recognizes deep administrative destinations without taking business routes", () => {
    expect(isAdministrationPath(appRoutes.platform.administration.rolePermissions("role-1"))).toBe(true);
    expect(isAdministrationPath(appRoutes.platform.advancedTools.errorLogs)).toBe(true);
    expect(isAdministrationPath(appRoutes.platform.companyGeographicScope)).toBe(true);
    expect(isAdministrationPath("/administration-other")).toBe(false);
    expect(isAdministrationPath(appRoutes.platform.files.manager)).toBe(false);
  });
});
