import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import {
  getFrontendSubmoduleDefinition,
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

  it("contains only server-owned HR submodules", () => {
    expect(hrModuleDefinition.code).toBe("hr");
    expect(hrModuleDefinition.submodules.map((item) => item.code)).toEqual([
      "basic-data",
      "recruitment",
      "workforce",
      "attendance",
    ]);
    expect(getFrontendSubmoduleDefinition("hr", "analytics")).toBeUndefined();
    expect(getFrontendSubmoduleDefinition("hr", "administration")).toBeUndefined();
    expect(getFrontendSubmoduleDefinition("hr", "collaboration")).toBeUndefined();
  });

  it("maps only HR-owned routes to HR submodules", () => {
    expect(requiredModuleForPath(appRoutes.basicData.organizationalStructure.index)).toEqual({
      moduleCode: "hr",
      submoduleCode: "basic-data",
    });
    expect(requiredModuleForPath(appRoutes.recruitment)).toEqual({
      moduleCode: "hr",
      submoduleCode: "recruitment",
    });
    expect(requiredModuleForPath(appRoutes.workforcePlanning.index)).toEqual({
      moduleCode: "hr",
      submoduleCode: "workforce",
    });
    expect(requiredModuleForPath(appRoutes.attendanceDevices.users)).toEqual({
      moduleCode: "hr",
      submoduleCode: "attendance",
    });
  });

  it("does not claim Platform, Reporting, CRM or Accounting routes", () => {
    expect(requiredModuleForPath(appRoutes.advancedTools.localizationApi)).toBeNull();
    expect(requiredModuleForPath(appRoutes.auth.rolesPage)).toBeNull();
    expect(requiredModuleForPath(appRoutes.auth.offlineOperationsPage)).toBeNull();
    expect(requiredModuleForPath(appRoutes.auth.crystalReportsPage)).toBeNull();
    expect(requiredModuleForPath(appRoutes.extras.appointments)).toBeNull();
    expect(requiredModuleForPath(appRoutes.finance.fiscalYears)).toBeNull();
  });

  it("lazy-loads only current HR submodule translations", async () => {
    await expect(hrModuleDefinition.loadTranslations?.("en")).resolves.toEqual({
      name: "Human Resources",
      submodules: {
        "basic-data": "Basic data",
        recruitment: "Recruitment",
        workforce: "Workforce planning",
        attendance: "Attendance",
      },
    });
    await expect(hrModuleDefinition.loadTranslations?.("ar")).resolves.toEqual({
      name: "الموارد البشرية",
      submodules: {
        "basic-data": "البيانات الأساسية",
        recruitment: "التوظيف",
        workforce: "تخطيط القوى العاملة",
        attendance: "الحضور والانصراف",
      },
    });
  });
});
