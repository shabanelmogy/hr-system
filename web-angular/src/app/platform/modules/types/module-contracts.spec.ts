import { knownModules, areaPath } from '../presentation/module-registry';
import { parseModuleCatalog } from './module-contracts';
import { catalogFixture } from '../module.fixture';
describe('Authoritative module catalog boundary', () => {
  it('normalizes case without trusting an entryPath as an Angular destination', () => {
    const modules = parseModuleCatalog([{ ...catalogFixture[0], code: 'HR', submodules: [{ ...catalogFixture[0].submodules[0], entryPath: 'https://untrusted.example/' }] }]);
    expect(modules[0].code).toBe('hr'); expect(areaPath(modules[0].code, modules[0].submodules[0].code)).toBe('/apps/hr/basic-data');
  });
  it('rejects malformed fields, path-shaped codes and duplicate case-insensitive identities', () => {
    for (const value of [null, {}, [{ ...catalogFixture[0], code: '../hr' }], [{ ...catalogFixture[0], isDefault: 'true' }],
      [{ ...catalogFixture[0], submodules: [{ ...catalogFixture[0].submodules[0], requiredPermissions: [1] }] }],
      [...catalogFixture, { ...catalogFixture[0], code: 'HR' }], [{ ...catalogFixture[0], submodules: [catalogFixture[0].submodules[0], catalogFixture[0].submodules[0]] }]]) {
      expect(() => parseModuleCatalog(value)).toThrow();
    }
  });
  it('intersects server membership with known presentation without adding a locally known grant', () => {
    const modules = parseModuleCatalog([...catalogFixture, { ...catalogFixture[0], code: 'unknown-module' }]);
    expect(knownModules(modules).map(m => m.code)).toEqual(['hr']); expect(knownModules([])).toEqual([]);
    expect(knownModules([{ ...modules[0], submodules: [{ ...modules[0].submodules[0], code: 'unknown-area' }] }])).toEqual([]);
  });
});
