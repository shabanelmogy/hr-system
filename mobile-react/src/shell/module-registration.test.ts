import { ROUTES } from '@/src/core/constants/routes';
import { accountingModuleDefinition } from '@/src/modules/accounting';
import { requiredModuleForPath } from '@/src/platform/auth/rbac';
import { hrModuleDefinition } from '@/src/modules/hr';
import type { ErpModule } from '@/src/platform/modules/registry';
import {
  findMobileRouteOwner,
  getMobileModuleDefinitions,
  intersectModulesWithMobileRegistry,
  registerMobileModule,
  resetMobileModuleRegistryForTests,
  validateMobileModuleRegistry,
} from '@/src/platform/modules/registry';

const serverModules: ErpModule[] = [
  {
    code: 'hr',
    name: 'HR',
    submodules: [
      { code: 'basic-data', name: 'Basic data', requiredPermissions: [] },
      { code: 'workforce', name: 'Workforce', requiredPermissions: [] },
      { code: 'future-hr', name: 'Future HR', requiredPermissions: [] },
    ],
  },
  { code: 'acc', name: 'Accounting', submodules: [] },
  { code: 'platform', name: 'Platform', submodules: [] },
];

describe('mobile module registration', () => {
  beforeEach(() => {
    resetMobileModuleRegistryForTests();
    registerMobileModule(hrModuleDefinition);
    registerMobileModule(accountingModuleDefinition);
    validateMobileModuleRegistry();
  });

  afterEach(() => resetMobileModuleRegistryForTests());

  it('registers the user-facing HR and Accounting modules only', () => {
    expect(getMobileModuleDefinitions().map(module => module.code)).toEqual(['acc', 'hr']);
    expect(intersectModulesWithMobileRegistry(serverModules)).toEqual([
      { ...serverModules[0], submodules: serverModules[0].submodules.slice(0, 2) },
      serverModules[1],
    ]);
  });

  it('keeps technical Platform out of the launcher contract', () => {
    expect(intersectModulesWithMobileRegistry(serverModules).some(module => module.code === 'platform'))
      .toBe(false);
  });

  it('keeps entitlement route requirements aligned with module route ownership', () => {
    for (const route of [
      ROUTES.basicData.countries,
      ROUTES.recruitment.root,
      ROUTES.workforcePlanning.plans,
      ROUTES.advancedTools.localizationApi,
      ROUTES.advancedTools.trackChanges,
      ROUTES.administration.offlineOperations,
    ]) {
      expect(requiredModuleForPath(route)).toEqual(findMobileRouteOwner(route));
    }
  });
  it('uses most-specific route ownership for overlapping HR submodules', () => {
    expect(findMobileRouteOwner(ROUTES.advancedTools.localizationApi)).toEqual({ moduleCode: 'hr', submoduleCode: 'basic-data' });
    expect(findMobileRouteOwner(ROUTES.advancedTools.trackChanges)).toEqual({ moduleCode: 'hr', submoduleCode: 'analytics' });
    expect(findMobileRouteOwner(ROUTES.advancedTools.healthCheck)).toEqual({ moduleCode: 'hr', submoduleCode: 'administration' });
    expect(findMobileRouteOwner(ROUTES.workforcePlanning.plans)).toEqual({ moduleCode: 'hr', submoduleCode: 'workforce' });
  });
});