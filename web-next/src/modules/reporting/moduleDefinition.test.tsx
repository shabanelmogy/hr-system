import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  registerFrontendModule,
  requiredModuleForPath,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { reportingModuleDefinition } from "./moduleDefinition";

describe("Reporting frontend module definition", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(reportingModuleDefinition);
  });

  it("owns Crystal Reports through Reporting analytics", () => {
    expect(reportingModuleDefinition.code).toBe("reporting");
    expect(reportingModuleDefinition.submodules[0]).toMatchObject({
      code: "analytics",
      entryCandidates: [appRoutes.auth.crystalReportsPage],
    });
    expect(reportingModuleDefinition.submodules[0]?.requiredPermissions).toEqual(
      expect.arrayContaining([
        permissions.ViewCrystalReports,
        permissions.ManageCrystalReportAccess,
      ]),
    );
    expect(requiredModuleForPath(appRoutes.auth.crystalReportsPage)).toEqual({
      moduleCode: "reporting",
      submoduleCode: "analytics",
    });
  });
});
