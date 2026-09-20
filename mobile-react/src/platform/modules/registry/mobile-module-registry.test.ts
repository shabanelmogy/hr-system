import type { ErpModule } from '../domain/models/module';
import type { AppRoute } from '@/src/core/constants/routes';
import {
  intersectModulesWithMobileRegistry,
  registerMobileModule,
  resetMobileModuleRegistryForTests,
  validateMobileModuleRegistry,
  type MobileModuleDefinition,
} from './mobile-module-registry';

const catalogDefinition: MobileModuleDefinition = {
  code: 'catalog',
  requiredDependencies: [],
  optionalDependencies: [],
  submodules: [{
    code: 'known',
    entryCandidates: ['/known' as AppRoute],
    routePrefixes: ['/known'],
  }],
};

const serverModules: ErpModule[] = [
  {
    code: 'catalog',
    name: 'Catalog',
    submodules: [
      { code: 'known', name: 'Known', requiredPermissions: [] },
      { code: 'unknown', name: 'Unknown', requiredPermissions: [] },
    ],
  },
  { code: 'technical', name: 'Technical', submodules: [] },
];

describe('mobile module registry', () => {
  beforeEach(() => {
    resetMobileModuleRegistryForTests();
    registerMobileModule(catalogDefinition);
  });

  afterEach(() => resetMobileModuleRegistryForTests());

  it('keeps only modules and submodules implemented by this mobile build', () => {
    expect(intersectModulesWithMobileRegistry(serverModules)).toEqual([{
      ...serverModules[0],
      submodules: [serverModules[0].submodules[0]],
    }]);
  });

  it('rejects duplicate exact route ownership', () => {
    registerMobileModule({
      code: 'duplicate',
      requiredDependencies: [],
      optionalDependencies: [],
      submodules: [{ code: 'other', entryCandidates: ['/known' as AppRoute], routePrefixes: ['/known'] }],
    });
    expect(() => validateMobileModuleRegistry()).toThrow('Ambiguous mobile module route');
  });

  it('rejects missing required module dependencies', () => {
    resetMobileModuleRegistryForTests();
    registerMobileModule({
      code: 'sales',
      requiredDependencies: ['inventory'],
      optionalDependencies: [],
      submodules: [],
    });
    expect(() => validateMobileModuleRegistry()).toThrow('Missing mobile module dependencies');
  });

  it('rejects dead submodules without an entry candidate or route prefix', () => {
    resetMobileModuleRegistryForTests();
    registerMobileModule({
      code: 'dead',
      requiredDependencies: [],
      optionalDependencies: [],
      submodules: [{ code: 'empty', entryCandidates: [], routePrefixes: [] }],
    });

    expect(() => validateMobileModuleRegistry()).toThrow(
      "must declare at least one entry candidate and route prefix",
    );
  });
});
