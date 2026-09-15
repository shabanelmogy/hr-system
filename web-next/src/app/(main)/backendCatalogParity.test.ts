import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { accountingModuleDefinition } from "@/modules/accounting";
import { crmModuleDefinition } from "@/modules/crm";
import { hrModuleDefinition } from "@/modules/hr";
import { referenceDataModuleDefinition } from "@/modules/reference-data";
import { reportingModuleDefinition } from "@/modules/reporting";
import type { FrontendModuleDefinition } from "@/platform/modules";

type BackendModuleSource = {
  path: URL;
  label: string;
};

const backendModuleSources: readonly BackendModuleSource[] = [
  {
    path: new URL(
      "../../../../api/Modules/Accounting/ErpSystem.Modules.Accounting/AccountingModule.cs",
      import.meta.url,
    ),
    label: "Accounting",
  },
  {
    path: new URL(
      "../../../../api/Modules/Contacts/ErpSystem.Modules.Contacts/ContactsModule.cs",
      import.meta.url,
    ),
    label: "Contacts",
  },
  {
    path: new URL(
      "../../../../api/Modules/CRM/ErpSystem.Modules.CRM/CrmModule.cs",
      import.meta.url,
    ),
    label: "CRM",
  },
  {
    path: new URL(
      "../../../../api/Modules/HR/ErpSystem.Modules.HR/HrModuleDefinition.cs",
      import.meta.url,
    ),
    label: "HR",
  },
  {
    path: new URL(
      "../../../../api/Modules/Inventory/ErpSystem.Modules.Inventory/InventoryModule.cs",
      import.meta.url,
    ),
    label: "Inventory",
  },
  {
    path: new URL(
      "../../../../api/Modules/PointOfSale/ErpSystem.Modules.PointOfSale/PointOfSaleModule.cs",
      import.meta.url,
    ),
    label: "PointOfSale",
  },
  {
    path: new URL(
      "../../../../api/Modules/ReferenceData/ErpSystem.Modules.ReferenceData/ReferenceDataModule.cs",
      import.meta.url,
    ),
    label: "ReferenceData",
  },
  {
    path: new URL(
      "../../../../api/Modules/Reporting/ErpSystem.Modules.Reporting/ReportingModule.cs",
      import.meta.url,
    ),
    label: "Reporting",
  },
] as const;

const frontendDefinitions: readonly FrontendModuleDefinition[] = [
  hrModuleDefinition,
  accountingModuleDefinition,
  crmModuleDefinition,
  referenceDataModuleDefinition,
  reportingModuleDefinition,
];

function parseBackendDefinition(source: string, label: string) {
  const moduleCode = /\bnew(?:\s+ModuleDefinition)?\s*\(\s*"([^"]+)"/.exec(source)?.[1];
  if (!moduleCode) {
    throw new Error(`Could not parse backend module code from ${label}.`);
  }

  const submoduleCodes = [
    ...source.matchAll(/\bSubmoduleDefinition\s*\(\s*"([^"]+)"/g),
  ]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));

  return { moduleCode, submoduleCodes };
}

describe("frontend/backend module catalog parity", () => {
  it("does not publish frontend business module identities absent from the backend catalog", async () => {
    const backendDefinitions = await Promise.all(
      backendModuleSources.map(async ({ path, label }) =>
        parseBackendDefinition(await readFile(path, "utf8"), label),
      ),
    );
    const backendByCode = new Map(
      backendDefinitions.map((definition) => [definition.moduleCode.toLowerCase(), definition]),
    );

    expect(backendByCode.size).toBe(backendDefinitions.length);

    for (const frontend of frontendDefinitions) {
      const backend = backendByCode.get(frontend.code.toLowerCase());
      expect(backend, `Frontend module '${frontend.code}' is not in the backend catalog`).toBeDefined();

      const backendSubmodules = new Set(
        backend?.submoduleCodes.map((code) => code.toLowerCase()) ?? [],
      );
      for (const submodule of frontend.submodules) {
        expect(
          backendSubmodules.has(submodule.code.toLowerCase()),
          `Frontend submodule '${frontend.code}:${submodule.code}' is not in the backend catalog`,
        ).toBe(true);
      }
    }
  });
});
