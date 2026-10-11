import type { TFunction } from 'i18next';

/** Translation keys for module codes from the API module catalog. */
const moduleTranslationKeys: Record<string, string> = {
  acc: 'accounting',
  contacts: 'contacts',
  crm: 'crm',
  hr: 'hr',
  inventory: 'inventory',
  platform: 'platform',
  'point-of-sale': 'pointOfSale',
  'reference-data': 'referenceData',
  reporting: 'reporting',
};

function humanizeCode(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
}

/** Display name of a module code; used wherever a module is listed (roles, tenant entitlements). */
export function getModuleLabel(moduleCode: string, t: TFunction): string {
  const key = moduleTranslationKeys[moduleCode.toLocaleLowerCase()];
  return key ? t(`roleManagement.businessModules.${key}`) : humanizeCode(moduleCode);
}
