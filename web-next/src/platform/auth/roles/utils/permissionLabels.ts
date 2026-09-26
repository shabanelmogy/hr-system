import type { TFunction } from "i18next";

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
