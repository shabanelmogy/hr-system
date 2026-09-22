import { ROUTES } from '@/src/core/constants/routes';
import { accountingModuleDefinition } from '@/src/modules/accounting';
import { crmModuleDefinition } from '@/src/modules/crm';
import { requiredModuleForPath } from '@/src/platform/auth/rbac';
import { hrModuleDefinition } from '@/src/modules/hr';
import { platformModuleDefinition } from '@/src/modules/platform';
import { referenceDataModuleDefinition } from '@/src/modules/reference-data';
import type { ErpModule } from '@/src/platform/modules/registry';
import {
  findMobileRouteOwner,
  getMobileModuleDefinitions,
  intersectModulesWithMobileRegistry,
  registerMobileModule,
  resetMobileModuleRegistryForTests,
  validateMobileModuleRegistry,
} from '@/src/platform/modules/registry';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/src/modules/accounting', () => jest.requireActual('@/src/modules/accounting/moduleDefinition'));
jest.mock('@/src/modules/crm', () => jest.requireActual('@/src/modules/crm/moduleDefinition'));
jest.mock('@/src/modules/hr', () => jest.requireActual('@/src/modules/hr/moduleDefinition'));
jest.mock('@/src/modules/platform', () => jest.requireActual('@/src/modules/platform/moduleDefinition'));
jest.mock('@/src/modules/reference-data', () => jest.requireActual('@/src/modules/reference-data/moduleDefinition'));

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
  { code: 'reference-data', name: 'Reference Data', submodules: [{ code: 'geography', name: 'Geography', requiredPermissions: [] }] },
  { code: 'crm', name: 'CRM', submodules: [{ code: 'appointments', name: 'Appointments', requiredPermissions: [] }] },
];

describe('mobile module registration', () => {
  beforeEach(() => {
    resetMobileModuleRegistryForTests();
    registerMobileModule(hrModuleDefinition);
    registerMobileModule(accountingModuleDefinition);
    registerMobileModule(crmModuleDefinition);
    registerMobileModule(platformModuleDefinition);
    registerMobileModule(referenceDataModuleDefinition);
    validateMobileModuleRegistry();
  });

  afterEach(() => resetMobileModuleRegistryForTests());

  it('registers every API-owned module surfaced by this build', () => {
    expect(getMobileModuleDefinitions().map(module => module.code)).toEqual(['acc', 'crm', 'hr', 'platform', 'reference-data']);
    expect(intersectModulesWithMobileRegistry(serverModules)).toEqual([
      { ...serverModules[0], submodules: serverModules[0].submodules.slice(0, 2) },
      serverModules[1],
      serverModules[2],
      serverModules[3],
      serverModules[4],
    ]);
  });

  it('keeps server modules unsupported by the mobile build out of the launcher contract', () => {
    const unsupported = { code: 'future', name: 'Future', submodules: [] };
    expect(intersectModulesWithMobileRegistry(serverModules).some(module => module.code === 'platform'))
      .toBe(true);
    expect(intersectModulesWithMobileRegistry([...serverModules, unsupported])).not.toContainEqual(unsupported);
  });

  it('keeps entitlement route requirements aligned with module route ownership', () => {
    for (const route of [
      ROUTES.basicData.countries,
      ROUTES.recruitment.root,
      ROUTES.workforcePlanning.plans,
      ROUTES.advancedTools.localizationApi,
      ROUTES.advancedTools.trackChanges,
      ROUTES.administration.offlineOperations,
      ROUTES.finance.currencies,
    ]) {
      expect(requiredModuleForPath(route)).toEqual(findMobileRouteOwner(route));
    }
  });
  it('uses API ownership for routes moved out of HR', () => {
    expect(findMobileRouteOwner(ROUTES.basicData.countries)).toEqual({ moduleCode: 'reference-data', submoduleCode: 'geography' });
    expect(findMobileRouteOwner(ROUTES.advancedTools.localizationApi)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
    expect(findMobileRouteOwner(ROUTES.advancedTools.trackChanges)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
    expect(findMobileRouteOwner(ROUTES.advancedTools.healthCheck)).toEqual({ moduleCode: 'platform', submoduleCode: 'operations' });
    expect(findMobileRouteOwner(ROUTES.extras.appointments)).toEqual({ moduleCode: 'crm', submoduleCode: 'appointments' });
    expect(findMobileRouteOwner(ROUTES.workforcePlanning.plans)).toEqual({ moduleCode: 'hr', submoduleCode: 'workforce' });
    expect(findMobileRouteOwner(ROUTES.finance.currencies)).toEqual({ moduleCode: 'acc', submoduleCode: 'ledger-setup' });
  });
});
