export { moduleApi, moduleKeys } from "./moduleApi";
export type { ErpModule, ModuleSubmodule } from "./types";
export {
  useAccessibleModulesQuery,
  useInstalledModulesQuery,
  useTenantEntitlementModulesQuery,
} from "./useModulesQuery";
export { toLauncherModule, toLauncherModules } from "./modulePresentation";
export { ModuleContextSwitcher } from "./ModuleContextSwitcher";
export { ModuleLauncherPage } from "./ModuleLauncherPage";
export { ModuleOverviewPage } from "./ModuleOverviewPage";
export { SubmoduleEntryPage } from "./SubmoduleEntryPage";
export {
  registerFrontendModule,
  getFrontendModuleDefinition,
  getFrontendModuleDefinitions,
  getFrontendSubmoduleDefinition,
  intersectAccessibleModulesWithFrontendRegistry,
  validateFrontendModuleRegistry,
  resetFrontendModuleRegistryForTests,
} from "./registry";
export type {
  FrontendModuleDefinition,
  FrontendSubmoduleDefinition,
  FrontendNavigationEntry,
  FrontendNavigationSection,
} from "./registry";
export {
  requiredModuleForPath,
  hasModuleAccess,
  canAccessPathByModules,
} from "./routeRequirements";
export {
  ensureModuleTranslations,
  useModuleTranslations,
} from "./useModuleTranslations";
export type {
  ModuleRequirement,
  AccessibleModuleDefinition,
} from "./routeRequirements";
