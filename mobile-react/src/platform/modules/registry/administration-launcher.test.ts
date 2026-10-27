import { ROUTES } from '@/src/core/constants/routes';
import { getAdministrationModule } from './administration-launcher';
jest.mock('@/src/platform/auth', () => ({ permissions: { ViewUsers: 'Users:View' } }));
const t = (key: string) => key;
it('omits empty Administration and excludes Users without its exact grant', () => {
  expect(getAdministrationModule(() => false, () => false, t)).toBeNull();
  expect(getAdministrationModule(path => path === ROUTES.administration.root, () => false, t)).toBeNull();
});
it('groups Settings, Users and diagnostics while excluding ungranted children', () => {
  const allowed = [ROUTES.settings, ROUTES.administration.root, ROUTES.advancedTools.errorLogs];
  const module = getAdministrationModule(path => allowed.includes(path as typeof allowed[number]), () => true, t);
  expect(module?.code).toBe('administration');
  expect(module?.submodules.map(item => item.entryPath).sort()).toEqual([...allowed].sort());
  expect(module?.submodules.some(item => item.entryPath === ROUTES.administration.companyLocalizations)).toBe(false);
});
it('recomputes translated labels and visibility without retaining company grants', () => {
  const first = getAdministrationModule(path => path === ROUTES.administration.roles, () => true, t);
  const second = getAdministrationModule(path => path === ROUTES.settings, () => true, key => `ar:${key}`);
  expect(first?.submodules[0].entryPath).toBe(ROUTES.administration.roles);
  expect(second?.submodules).toHaveLength(1);
  expect(second?.submodules[0].name).toBe('ar:navigation.settings');
});
