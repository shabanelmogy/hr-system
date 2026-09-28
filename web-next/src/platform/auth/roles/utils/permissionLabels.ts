import type { TFunction } from "i18next";

const businessModuleTranslationKeys: Record<string, string> = {
  acc: "accounting",
  contacts: "contacts",
  crm: "crm",
  hr: "hr",
  inventory: "inventory",
  platform: "platform",
  "point-of-sale": "pointOfSale",
  "reference-data": "referenceData",
  reporting: "reporting",
};

export function getPermissionBusinessModuleLabel(moduleCode: string, t: TFunction): string {
  const key = businessModuleTranslationKeys[moduleCode.toLowerCase()];
  return key
    ? t(`roles.businessModules.${key}`, { defaultValue: humanize(moduleCode) })
    : humanize(moduleCode);
}

export function getPermissionResourceLabel(resource: string, t: TFunction): string {
  return t(`roles.permissionResources.${resource}`, { defaultValue: humanize(resource) });
}

export function getPermissionActionLabel(action: string, t: TFunction): string {
  return t(`roles.permissionActions.${action}`, { defaultValue: humanize(action) });
}

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
}
