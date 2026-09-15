import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type { ErpModule } from "./types";

export const moduleKeys = {
  all: ["modules"] as const,
  accessible: () => [...moduleKeys.all, "accessible"] as const,
  installed: () => [...moduleKeys.all, "installed"] as const,
  tenantEntitlements: () => [...moduleKeys.all, "tenant-entitlements"] as const,
};

export const moduleApi = {
  getAccessible: async () => parseModulesResponse(
    await apiService.get<unknown>(apiRoutes.modules.accessible),
  ),
  getInstalled: async () => parseModulesResponse(
    await apiService.get<unknown>(apiRoutes.modules.installed),
  ),
  getTenantEntitlements: async () => parseModulesResponse(
    await apiService.get<unknown>(apiRoutes.modules.tenantEntitlements),
  ),
};

export function parseModulesResponse(value: unknown): ErpModule[] {
  if (!Array.isArray(value)) throw new Error("Invalid modules response.");
  return value.map(parseModule);
}

function parseModule(value: unknown): ErpModule {
  const moduleRecord = asRecord(value);
  if (!moduleRecord
    || typeof moduleRecord.code !== "string"
    || typeof moduleRecord.name !== "string"
    || !Array.isArray(moduleRecord.submodules)
    || typeof moduleRecord.isDefault !== "boolean") {
    throw new Error("Invalid module response.");
  }

  return {
    code: moduleRecord.code,
    name: moduleRecord.name,
    submodules: moduleRecord.submodules.map(parseSubmodule),
    isDefault: moduleRecord.isDefault,
  };
}

function parseSubmodule(value: unknown): ErpModule["submodules"][number] {
  const submodule = asRecord(value);
  const entryPath = submodule?.entryPath;
  if (!submodule
    || typeof submodule.code !== "string"
    || typeof submodule.name !== "string"
    || !Array.isArray(submodule.requiredPermissions)
    || !submodule.requiredPermissions.every((permission) => typeof permission === "string")
    || !(entryPath === null || typeof entryPath === "string")) {
    throw new Error("Invalid module submodule response.");
  }

  return {
    code: submodule.code,
    name: submodule.name,
    requiredPermissions: [...submodule.requiredPermissions] as string[],
    entryPath: entryPath === null ? null : entryPath as string,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
