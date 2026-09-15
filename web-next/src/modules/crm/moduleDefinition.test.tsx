import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  registerFrontendModule,
  requiredModuleForPath,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { crmModuleDefinition } from "./moduleDefinition";

describe("CRM frontend module definition", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(crmModuleDefinition);
  });

  it("owns Appointments", () => {
    expect(crmModuleDefinition.code).toBe("crm");
    expect(crmModuleDefinition.submodules[0]).toMatchObject({
      code: "appointments",
      requiredPermissions: [permissions.ViewAppointments],
      entryCandidates: [appRoutes.extras.appointments],
    });
    expect(requiredModuleForPath(appRoutes.extras.appointments)).toEqual({
      moduleCode: "crm",
      submoduleCode: "appointments",
    });
  });
});
