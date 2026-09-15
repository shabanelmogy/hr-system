export { ModuleLauncherScreen } from './presentation/screens/ModuleLauncherScreen';
export { SubmoduleEntryScreen } from './presentation/screens/SubmoduleEntryScreen';
export {
  useAccessibleModules,
  useInstalledModules,
  useTenantEntitlementModules,
} from './presentation/queries/use-modules';
export type { ErpModule } from './domain/models/module';
export {
  findMobileRouteOwner,
  getMobileModuleDefinition,
  getMobileModuleDefinitions,
  getMobileSubmoduleDefinition,
  intersectModulesWithMobileRegistry,
  registerMobileModule,
  validateMobileModuleRegistry,
} from './registry';
export type { MobileModuleDefinition, MobileSubmoduleDefinition } from './registry';
