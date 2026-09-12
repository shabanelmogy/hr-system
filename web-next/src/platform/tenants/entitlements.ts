import type { ErpModule } from "@/platform/modules";

export interface EditableEntitlement {
  moduleCode: string;
  submoduleCodes: string[];
}

export function createDefaultEntitlements(
  installedModules: readonly ErpModule[],
): EditableEntitlement[] {
  return installedModules
    .filter((module) => module.isDefault ?? module.code.toLowerCase() === "hr")
    .map((module) => ({
      moduleCode: module.code,
      submoduleCodes: module.submodules.map((item) => item.code),
    }));
}

export function hydrateEntitlements(
  saved: readonly EditableEntitlement[] | null | undefined,
  installedModules: readonly ErpModule[],
): EditableEntitlement[] {
  if (saved == null) return createDefaultEntitlements(installedModules);
  return saved.map((item) => ({
    moduleCode: item.moduleCode,
    submoduleCodes: [...item.submoduleCodes],
  }));
}

export function toggleModuleEntitlement(
  current: readonly EditableEntitlement[],
  module: ErpModule,
  enabled: boolean,
): EditableEntitlement[] {
  const sameModule = (item: EditableEntitlement) =>
    item.moduleCode.localeCompare(module.code, undefined, { sensitivity: "accent" }) === 0;
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
