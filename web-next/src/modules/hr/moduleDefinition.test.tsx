import { beforeEach, describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  canAccessPathByModules,
  getFrontendSubmoduleDefinition,
  hasModuleAccess,
  registerFrontendModule,
  requiredModuleForPath,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { hrModuleDefinition } from "./moduleDefinition";

describe("HR frontend module definition", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(hrModuleDefinition);
  });

  it("maps legacy routes to their server-owned HR submodules", () => {
    expect(requiredModuleForPath("/apps/hr/recruitment")).toEqual({ moduleCode: "hr", submoduleCode: "recruitment" });
    expect(requiredModuleForPath(appRoutes.advancedTools.localizationApi)).toEqual({ moduleCode: "hr", submoduleCode: "basic-data" });
    expect(requiredModuleForPath(appRoutes.advancedTools.trackChanges)).toEqual({ moduleCode: "hr", submoduleCode: "analytics" });
    expect(requiredModuleForPath(appRoutes.attendanceTrends)).toEqual({ moduleCode: "hr", submoduleCode: "analytics" });
    expect(requiredModuleForPath(appRoutes.auth.crystalReportsPage)).toEqual({ moduleCode: "hr", submoduleCode: "analytics" });
    expect(requiredModuleForPath(appRoutes.auth.rolesPage)).toEqual({ moduleCode: "hr", submoduleCode: "administration" });
    expect(requiredModuleForPath(appRoutes.auth.offlineOperationsPage)).toEqual({ moduleCode: "hr", submoduleCode: "administration" });
  });

  it("does not let the attendance prefix capture attendance analytics", () => {
    expect(requiredModuleForPath(appRoutes.attendanceDevices.index)).toEqual({ moduleCode: "hr", submoduleCode: "attendance" });
    expect(requiredModuleForPath("/attendance/shifts")).toEqual({ moduleCode: "hr", submoduleCode: "attendance" });
    expect(requiredModuleForPath(appRoutes.attendanceTrends)).not.toEqual({ moduleCode: "hr", submoduleCode: "attendance" });
  });

  it("keeps sidebar and guard entitlement checks on the same helper", () => {
    const analyticsOnly = [{ code: "HR", submodules: [{ code: "ANALYTICS" }] }];
    expect(hasModuleAccess(analyticsOnly, { moduleCode: "hr", submoduleCode: "analytics" })).toBe(true);
    expect(canAccessPathByModules(appRoutes.auth.crystalReportsPage, analyticsOnly)).toBe(true);
    expect(canAccessPathByModules(appRoutes.attendanceTrends, analyticsOnly)).toBe(true);
    expect(canAccessPathByModules(appRoutes.attendanceDevices.index, analyticsOnly)).toBe(false);
  });

  it("owns launcher entry candidates in the module definition", () => {
    expect(getFrontendSubmoduleDefinition("HR", "ANALYTICS")?.entryCandidates).toContain(appRoutes.auth.crystalReportsPage);
    expect(getFrontendSubmoduleDefinition("hr", "administration")?.entryCandidates).not.toContain(appRoutes.auth.crystalReportsPage);

    const administration = getFrontendSubmoduleDefinition("hr", "administration");
    expect(administration?.entryCandidates).toContain(appRoutes.auth.offlineOperationsPage);
    expect(administration?.requiredPermissions).toContain(permissions.ManageOfflineOperations);
  });

  it("lazy-loads the module translation resources for English and Arabic", async () => {
    await expect(hrModuleDefinition.loadTranslations?.("en")).resolves.toMatchObject({
      name: "Human Resources",
      submodules: { analytics: "Analytics" },
    });
    await expect(hrModuleDefinition.loadTranslations?.("ar")).resolves.toMatchObject({
      name: "الموارد البشرية",
      submodules: { analytics: "التحليلات" },
    });
  });
});
