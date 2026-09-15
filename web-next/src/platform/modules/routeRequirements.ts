import { APPS_ROUTE } from "@/lib/auth/route-access";
import {
  getFrontendModuleDefinitions,
  type FrontendModuleDefinition,
} from "./registry";

export type ModuleRequirement = {
  moduleCode: string;
  submoduleCode?: string;
};

export type AccessibleModuleDefinition = {
  code: string;
  submodules: readonly { code: string }[];
};

const normalizePath = (pathname: string) => {
  const value = pathname.trim();
  if (!value) return "/";
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
};

const matchesPrefix = (pathname: string, prefix: string) => {
  const normalizedPathname = normalizePath(pathname);
  const normalizedPrefix = normalizePath(prefix);
  return normalizedPathname === normalizedPrefix || normalizedPathname.startsWith(`${normalizedPrefix}/`);
};

export function requiredModuleForPath(pathname: string): ModuleRequirement | null {
  const normalizedPathname = normalizePath(pathname);
  if (normalizedPathname === APPS_ROUTE) return null;
  // Platform is an internal module and global ReferenceData geography is not a
  // tenant entitlement. These routes are protected by role/permission policies,
  // not by /modules/accessible.
  if (matchesPrefix(normalizedPathname, "/basic-data/organizational-structure/geographic-scope")) {
    return null;
  }
  if (normalizedPathname.startsWith(`${APPS_ROUTE}/`)) {
    const [, , moduleCode, submoduleCode] = normalizedPathname.split("/");
    return moduleCode ? { moduleCode, submoduleCode } : null;
  }

  let bestMatch: { requirement: ModuleRequirement; prefixLength: number } | null = null;
  for (const moduleDefinition of getFrontendModuleDefinitions()) {
    const match = requirementFromDefinition(normalizedPathname, moduleDefinition);
    if (match && (!bestMatch || match.prefixLength > bestMatch.prefixLength)) {
      bestMatch = match;
    }
  }
  return bestMatch?.requirement ?? null;
}

function requirementFromDefinition(
  pathname: string,
  moduleDefinition: FrontendModuleDefinition,
): { requirement: ModuleRequirement; prefixLength: number } | null {
  let bestMatch: { requirement: ModuleRequirement; prefixLength: number } | null = null;
  for (const submodule of moduleDefinition.submodules) {
    for (const prefix of submodule.routePrefixes) {
      if (matchesPrefix(pathname, prefix)) {
        const candidate = {
          requirement: { moduleCode: moduleDefinition.code, submoduleCode: submodule.code },
          prefixLength: normalizePath(prefix).length,
        };
        if (!bestMatch || candidate.prefixLength > bestMatch.prefixLength) {
          bestMatch = candidate;
        }
      }
    }
  }
  return bestMatch;
}

export function hasModuleAccess(
  modules: readonly AccessibleModuleDefinition[],
  requirement: ModuleRequirement,
): boolean {
  const moduleDefinition = modules.find(
    (item) => item.code.toLowerCase() === requirement.moduleCode.toLowerCase(),
  );
  if (!moduleDefinition) return false;
  if (!requirement.submoduleCode) return true;
  return moduleDefinition.submodules.some(
    (item) => item.code.toLowerCase() === requirement.submoduleCode?.toLowerCase(),
  );
}

export function canAccessPathByModules(
  pathname: string,
  modules: readonly AccessibleModuleDefinition[],
): boolean {
  const requirement = requiredModuleForPath(pathname);
  return requirement ? hasModuleAccess(modules, requirement) : true;
}
