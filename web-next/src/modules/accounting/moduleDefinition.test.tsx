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
    expect(accountingModuleDefinition.submodules).toHaveLength(2);
    expect(accountingModuleDefinition.submodules[0]).toMatchObject({
      code: "fiscal-years",
      requiredPermissions: [permissions.ViewFiscalYears],
      entryCandidates: [appRoutes.modules.accounting.fiscalYears],
      routePrefixes: [appRoutes.modules.accounting.fiscalYears],
    });
    expect(requiredModuleForPath(appRoutes.modules.accounting.fiscalYears)).toEqual({
      moduleCode: "acc",
      submoduleCode: "fiscal-years",
    });
    expect(accountingModuleDefinition.submodules[1]).toMatchObject({
      code: "ledger-setup",
      requiredPermissions: [permissions.ViewAccountingSetup],
      entryCandidates: [appRoutes.modules.accounting.ledgerSetup.currencies],
      routePrefixes: [appRoutes.modules.accounting.ledgerSetup.currencies],
    });
    expect(requiredModuleForPath(appRoutes.modules.accounting.ledgerSetup.currencies)).toEqual({
      moduleCode: "acc",
      submoduleCode: "ledger-setup",
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
