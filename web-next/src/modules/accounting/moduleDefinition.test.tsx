import { beforeEach, describe, expect, it } from "vitest";

import { appRoutes } from "@/config/routes";
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

  it("owns Fiscal Years as the first Ledger Setup capability", () => {
    expect(accountingModuleDefinition.code).toBe("acc");
    expect(accountingModuleDefinition.submodules).toHaveLength(1);
    expect(accountingModuleDefinition.submodules[0]).toMatchObject({
      code: "ledger-setup",
      requiredPermissions: [],
      entryCandidates: [
        appRoutes.modules.accounting.ledgerSetup.index,
        appRoutes.modules.accounting.ledgerSetup.fiscalYears,
        appRoutes.modules.accounting.ledgerSetup.accountingSettings,
        appRoutes.modules.accounting.ledgerSetup.currencies,
        appRoutes.modules.accounting.ledgerSetup.accounts,
        appRoutes.modules.accounting.ledgerSetup.hierarchyLevels,
        appRoutes.modules.accounting.ledgerSetup.dimensions,
        appRoutes.modules.accounting.ledgerSetup.books,
        appRoutes.modules.accounting.ledgerSetup.journals,
        appRoutes.modules.accounting.ledgerSetup.exchangeRates,
        appRoutes.modules.accounting.ledgerSetup.accountDetermination,
      ],
      routePrefixes: [appRoutes.modules.accounting.ledgerSetup.index],
    });
    expect(accountingModuleDefinition.submodules[0]?.navigation
      ?.flatMap((section) => section.entries)
      .map((entry) => entry.path)).toContain(appRoutes.modules.accounting.ledgerSetup.fiscalYears);
    expect(requiredModuleForPath(appRoutes.modules.accounting.ledgerSetup.fiscalYears)).toEqual({
      moduleCode: "acc",
      submoduleCode: "ledger-setup",
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
