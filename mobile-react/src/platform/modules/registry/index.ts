export {
  findMobileRouteOwner,
  getMobileModuleDefinition,
  getMobileModuleDefinitions,
  getMobileSubmoduleDefinition,
  intersectModulesWithMobileRegistry,
  registerMobileModule,
  resetMobileModuleRegistryForTests,
  validateMobileModuleRegistry,
} from './mobile-module-registry';
export type {
  MobileModuleDefinition,
  MobileSubmoduleDefinition,
} from './mobile-module-registry';
export type { ErpModule, ModuleSubmodule } from '../domain/models/module';