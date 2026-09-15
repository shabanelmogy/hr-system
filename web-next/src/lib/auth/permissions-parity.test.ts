import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { permissions } from "./permissions";

type BackendPermissionSource = {
  path: URL;
  className: string;
};

const backendPermissionSources: readonly BackendPermissionSource[] = [
  {
    path: new URL(
      "../../../../api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/Authorization/AccountingPermissions.cs",
      import.meta.url,
    ),
    className: "AccountingPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/Contacts/ErpSystem.Modules.Contacts.Application/Parties/PartyPermissions.cs",
      import.meta.url,
    ),
    className: "PartyPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/CRM/ErpSystem.Modules.CRM.Contracts/Authorization/CrmPermissions.cs",
      import.meta.url,
    ),
    className: "CrmPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/HR/ErpSystem.Modules.HR.Contracts/Authorization/HrPermissions.cs",
      import.meta.url,
    ),
    className: "HrPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/Inventory/ErpSystem.Modules.Inventory.Contracts/Authorization/InventoryPermissions.cs",
      import.meta.url,
    ),
    className: "InventoryPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/Platform/ErpSystem.Modules.Platform.Contracts/Authorization/PermissionContracts.cs",
      import.meta.url,
    ),
    className: "PlatformPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/ReferenceData/ErpSystem.Modules.ReferenceData.Contracts/Authorization/ReferenceDataPermissions.cs",
      import.meta.url,
    ),
    className: "ReferenceDataPermissions",
  },
  {
    path: new URL(
      "../../../../api/Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Authorization/ReportingPermissions.cs",
      import.meta.url,
    ),
    className: "ReportingPermissions",
  },
] as const;

function classBody(source: string, className: string): string {
  const marker = new RegExp(`\\bclass\\s+${className}\\b`);
  const match = marker.exec(source);
  if (!match) throw new Error(`Backend permission class '${className}' was not found.`);

  const bodyStart = source.indexOf("{", match.index);
  if (bodyStart < 0) throw new Error(`Backend permission class '${className}' has no body.`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(bodyStart + 1, index);
    }
  }
  throw new Error(`Backend permission class '${className}' has an unterminated body.`);
}

function parsePermissionValues(source: string, className: string): string[] {
  const body = classBody(source, className);
  return [...body.matchAll(/public\s+const\s+string\s+\w+\s*=\s*"([^"]+)"\s*;/g)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
}

describe("permission constants", () => {
  it("stays in exact parity with every current backend permission catalog", async () => {
    const backendPermissions = (
      await Promise.all(
        backendPermissionSources.map(async ({ path, className }) =>
          parsePermissionValues(await readFile(path, "utf8"), className),
        ),
      )
    ).flat();
    const frontendPermissions = Object.values(permissions);

    expect(backendPermissions.length).toBeGreaterThan(0);
    expect(new Set(backendPermissions).size).toBe(backendPermissions.length);
    expect(new Set(frontendPermissions).size).toBe(frontendPermissions.length);
    expect([...frontendPermissions].sort()).toEqual([...backendPermissions].sort());
  });
});
