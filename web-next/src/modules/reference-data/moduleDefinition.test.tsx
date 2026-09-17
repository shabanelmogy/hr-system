import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  registerFrontendModule,
  requiredModuleForPath,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { referenceDataModuleDefinition } from "./moduleDefinition";

describe("ReferenceData frontend module definition", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(referenceDataModuleDefinition);
  });

  it("owns the tenant-visible Addresses submodule entry", () => {
    expect(referenceDataModuleDefinition.code).toBe("reference-data");
    expect(referenceDataModuleDefinition.submodules[0]).toMatchObject({
      code: "addresses",
      requiredPermissions: [permissions.ViewAddressTypes],
      entryCandidates: [appRoutes.modules.referenceData.addressTypes],
    });
    expect(requiredModuleForPath(appRoutes.modules.referenceData.addressTypes)).toEqual({
      moduleCode: "reference-data",
      submoduleCode: "addresses",
    });
  });
});
