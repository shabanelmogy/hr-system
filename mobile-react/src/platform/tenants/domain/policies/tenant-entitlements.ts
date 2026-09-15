import type { TenantModuleEntitlementRequest } from '../models/tenant';

export interface TenantEntitlementModule {
  code: string;
  isDefault?: boolean;
  submodules: readonly { code: string }[];
}

export function createDefaultEntitlements(
  tenantEntitlementModules: readonly TenantEntitlementModule[],
): TenantModuleEntitlementRequest[] {
  return tenantEntitlementModules
    .filter((module) => module.isDefault ?? module.code.toLowerCase() === 'hr')
    .map((module) => ({
      moduleCode: module.code,
      submoduleCodes: module.submodules.map((item) => item.code),
    }));
}

export function hydrateEntitlements(
  saved: readonly TenantModuleEntitlementRequest[] | null | undefined,
  tenantEntitlementModules: readonly TenantEntitlementModule[],
): TenantModuleEntitlementRequest[] {
  if (saved == null) return createDefaultEntitlements(tenantEntitlementModules);
  return saved.flatMap((item) => {
    const module = tenantEntitlementModules.find(
      (candidate) => candidate.code.toLowerCase() === item.moduleCode.toLowerCase(),
    );
    if (!module) return [];

    const savedSubmodules = new Set(item.submoduleCodes.map((code) => code.toLowerCase()));
    return [{
      moduleCode: module.code,
      submoduleCodes: module.submodules
        .filter((submodule) => savedSubmodules.has(submodule.code.toLowerCase()))
        .map((submodule) => submodule.code),
    }];
  });
}

export function toggleModuleEntitlement(
  current: readonly TenantModuleEntitlementRequest[],
  module: TenantEntitlementModule,
  enabled: boolean,
): TenantModuleEntitlementRequest[] {
  const sameModule = (item: TenantModuleEntitlementRequest) =>
    item.moduleCode.toLowerCase() === module.code.toLowerCase();
  const existing = current.find(sameModule);
  const unchangedModules = current.filter((item) => !sameModule(item));

  if (!enabled) return unchangedModules;
  return [
    ...unchangedModules,
    existing ?? {
      moduleCode: module.code,
      submoduleCodes: module.submodules.map((item) => item.code),
    },
  ];
}

export function toggleSubmoduleEntitlement(
  current: readonly TenantModuleEntitlementRequest[],
  moduleCode: string,
  submoduleCode: string,
  enabled: boolean,
): TenantModuleEntitlementRequest[] {
  return current.map((item) => {
    if (item.moduleCode.toLowerCase() !== moduleCode.toLowerCase()) return item;
    const withoutSubmodule = item.submoduleCodes.filter(
      (code) => code.toLowerCase() !== submoduleCode.toLowerCase(),
    );
    return {
      ...item,
      submoduleCodes: enabled ? [...withoutSubmodule, submoduleCode] : withoutSubmodule,
    };
  });
}
