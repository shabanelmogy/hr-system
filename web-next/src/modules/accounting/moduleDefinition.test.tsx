import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import {
  registerFrontendModule,
  requiredModuleForPath,
  resetFrontendModuleRegistryForTests,
} from "@/platform/modules";
import { accountingModuleDefinition } from "./moduleDefinition";

describe("Accounting frontend module definition", () => {
  beforeEach(() => {
    resetFrontendModuleRegistryForTests();
    registerFrontendModule(accountingModuleDefinition);
  });

  it("owns the backend fiscal-years submodule", () => {
    expect(accountingModuleDefinition.code).toBe("acc");
    expect(accountingModuleDefinition.submodules).toHaveLength(1);
    expect(accountingModuleDefinition.submodules[0]).toMatchObject({
      code: "fiscal-years",
      requiredPermissions: [permissions.ViewFiscalYears],
      entryCandidates: [appRoutes.finance.fiscalYears],
      routePrefixes: [appRoutes.finance.fiscalYears],
    });
    expect(requiredModuleForPath(appRoutes.finance.fiscalYears)).toEqual({
      moduleCode: "acc",
      submoduleCode: "fiscal-years",
    });
  });

  it("lazy-loads English and Arabic module translations", async () => {
    await expect(accountingModuleDefinition.loadTranslations?.("en")).resolves.toEqual({
      name: "Accounting",
    });
    await expect(accountingModuleDefinition.loadTranslations?.("ar")).resolves.toEqual({
      name: "الحسابات",
    });
  });
});
