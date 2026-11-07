import { sessionFixture } from '../../platform/auth/auth.fixture';
import { tenantAdministrationEntries } from './tenant-navigation';

describe('Tenant workflows in Basic Data', () => {
  const text = (key: string) => key;
  const actor = { ...sessionFixture, roles: ['super_admin'] };
  it('groups both existing destinations and selects management on its nested creation route', () => {
    const entries = tenantAdministrationEntries(actor, text, '/super-admin/tenants/new');
    expect(entries.map((entry) => entry.id)).toEqual(['tenant-administration']);
    expect(entries[0]?.label).toBe('modules.tenantAdministration');
    expect(entries[0]?.children?.map((entry) => entry.id)).toEqual(['tenant-admins', 'tenants']);
    expect(entries[0]?.children?.map((entry) => entry.selected)).toEqual([false, true]);
    const administrators = tenantAdministrationEntries(actor, text, '/super-admin/tenant-admins');
    expect(administrators[0]?.children?.map((entry) => entry.selected)).toEqual([true, false]);
  });
  it('omits the whole branch for anonymous and tenant-scoped actors', () => {
    expect(tenantAdministrationEntries(null, text, '')).toEqual([]);
    expect(tenantAdministrationEntries(sessionFixture, text, '')).toEqual([]);
    expect(tenantAdministrationEntries({ ...actor, roles: ['admin'] }, text, '')).toEqual([]);
  });
});
