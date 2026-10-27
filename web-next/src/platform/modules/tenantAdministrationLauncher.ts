import { appRoutes } from "@/config/routes";
import { getPlatformNavigation } from "@/platform/navigation";
import type { ErpModule } from "./types";

export const ADMINISTRATION_MODULE_CODE = "administration";

/** Client navigation composition only; never changes installed/purchased modules. */
export function getAdministrationModule(
  canAccessPath: (path: string) => boolean,
  translate: (key: string) => string,
): ErpModule | null {
  const entries = getPlatformNavigation().find(section => section.id === "platform-administration")?.items ?? [];
  const submodules = entries.flatMap(item => item.path && canAccessPath(item.path) ? [{
    code: item.path.replace(/^\//, "").replaceAll("/", "-"),
    name: translate(item.title),
    requiredPermissions: [],
    entryPath: item.path,
  }] : []);
  return submodules.length ? {
    code: ADMINISTRATION_MODULE_CODE,
    name: translate("menu.administration"),
    submodules,
    isDefault: true,
  } : null;
}

/** Presentation identity only: child permission/entitlement policies are unchanged. */
export function isAdministrationPath(path: string): boolean {
  const roots = ["/administration", appRoutes.platform.companyGeographicScope,
    ...Object.values(appRoutes.platform.advancedTools)];
  return roots.some(root => path === root || path.startsWith(`${root}/`));
}
