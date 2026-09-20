import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { permissions } from './permissions';

type BackendPermissionSource = {
  relativePath: string;
  className: string;
};

const backendPermissionSources: readonly BackendPermissionSource[] = [
  {
    relativePath: 'api/Modules/Accounting/ErpSystem.Modules.Accounting.Contracts/Authorization/AccountingPermissions.cs',
    className: 'AccountingPermissions',
  },
  {
    relativePath: 'api/Modules/Contacts/ErpSystem.Modules.Contacts.Application/Parties/PartyPermissions.cs',
    className: 'PartyPermissions',
  },
  {
    relativePath: 'api/Modules/CRM/ErpSystem.Modules.CRM.Contracts/Authorization/CrmPermissions.cs',
    className: 'CrmPermissions',
  },
  {
    relativePath: 'api/Modules/HR/ErpSystem.Modules.HR.Contracts/Authorization/HrPermissions.cs',
    className: 'HrPermissions',
  },
  {
    relativePath: 'api/Modules/Inventory/ErpSystem.Modules.Inventory.Contracts/Authorization/InventoryPermissions.cs',
    className: 'InventoryPermissions',
  },
  {
    relativePath: 'api/Modules/Platform/ErpSystem.Modules.Platform.Contracts/Authorization/PermissionContracts.cs',
    className: 'PlatformPermissions',
  },
  {
    relativePath: 'api/Modules/ReferenceData/ErpSystem.Modules.ReferenceData.Contracts/Authorization/ReferenceDataPermissions.cs',
    className: 'ReferenceDataPermissions',
  },
  {
    relativePath: 'api/Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Authorization/ReportingPermissions.cs',
    className: 'ReportingPermissions',
  },
] as const;

function classBody(source: string, className: string): string {
  const match = new RegExp(`\\bclass\\s+${className}\\b`).exec(source);
  if (!match) throw new Error(`Backend permission class '${className}' was not found.`);
  const bodyStart = source.indexOf('{', match.index);
  if (bodyStart < 0) throw new Error(`Backend permission class '${className}' has no body.`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(bodyStart + 1, index);
    }
  }
  throw new Error(`Backend permission class '${className}' has an unterminated body.`);
}

function parsePermissionValues(source: string, className: string): string[] {
  return [...classBody(source, className).matchAll(/public\s+const\s+string\s+\w+\s*=\s*"([^"]+)"\s*;/g)]
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
}

describe('permission constants', () => {
  it('stays in exact parity with every current backend permission catalog', async () => {
    const repositoryRoot = resolve(__dirname, '../../../../../..');
    const backendPermissions = (
      await Promise.all(
        backendPermissionSources.map(async ({ relativePath, className }) =>
          parsePermissionValues(await readFile(resolve(repositoryRoot, relativePath), 'utf8'), className),
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
