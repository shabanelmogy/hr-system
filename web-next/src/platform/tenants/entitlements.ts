import type { ErpModule } from "@/platform/modules";

export interface EditableEntitlement {
  moduleCode: string;
  submoduleCodes: string[];
}

export function createDefaultEntitlements(
  tenantEntitlementModules: readonly ErpModule[],
): EditableEntitlement[] {
  return tenantEntitlementModules
    .filter((erpModule) => erpModule.isDefault)
    .map((erpModule) => ({
      moduleCode: erpModule.code,
      submoduleCodes: erpModule.submodules.map((item) => item.code),
    }));
}

export function hydrateEntitlements(
  saved: readonly EditableEntitlement[] | null | undefined,
  tenantEntitlementModules: readonly ErpModule[],
): EditableEntitlement[] {
  if (saved == null) return createDefaultEntitlements(tenantEntitlementModules);
  return saved.flatMap((item) => {
    const erpModule = tenantEntitlementModules.find(
      (candidate) => candidate.code.toLowerCase() === item.moduleCode.toLowerCase(),
    );
    if (!erpModule) return [];

    const savedSubmodules = new Set(item.submoduleCodes.map((code) => code.toLowerCase()));
    return [{
      moduleCode: erpModule.code,
      submoduleCodes: erpModule.submodules
        .filter((submodule) => savedSubmodules.has(submodule.code.toLowerCase()))
        .map((submodule) => submodule.code),
    }];
  });
}

export function toggleModuleEntitlement(
  current: readonly EditableEntitlement[],
  erpModule: ErpModule,
  enabled: boolean,
): EditableEntitlement[] {
  const sameModule = (item: EditableEntitlement) =>
    item.moduleCode.localeCompare(erpModule.code, undefined, { sensitivity: "accent" }) === 0;
  const existing = current.find(sameModule);
  const unchangedModules = current.filter((item) => !sameModule(item));

  if (!enabled) return unchangedModules;
  return [
    ...unchangedModules,
    existing ?? {
      moduleCode: erpModule.code,
      submoduleCodes: erpModule.submodules.map((item) => item.code),
    },
  ];
}

export function toggleSubmoduleEntitlement(
  current: readonly EditableEntitlement[],
  moduleCode: string,
  submoduleCode: string,
  enabled: boolean,
): EditableEntitlement[] {
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
