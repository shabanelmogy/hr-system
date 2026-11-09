import { sessionFixture } from '../../platform/auth/auth.fixture';
import { tenantAdministrationEntries } from './tenant-navigation';

describe('Tenant workflows in Basic Data', () => {
  const text = (key: string) => key;
  const actor = { ...sessionFixture, roles: ['super_admin'] };
  it('exposes only management and selects it for nested tenant workflows', () => {
    const entries = tenantAdministrationEntries(actor, text, '/super-admin/tenants/new');
    expect(entries.map((entry) => entry.id)).toEqual(['tenants']);
    expect(entries[0]?.label).toBe('menu.tenantManagement');
    expect(entries[0]?.children).toBeUndefined();
    expect(entries[0]?.selected).toBe(true);
    const administrators = tenantAdministrationEntries(
      actor,
      text,
      '/super-admin/tenants/administrators',
    );
    expect(administrators[0]?.selected).toBe(true);
  });
  it('omits the whole branch for anonymous and tenant-scoped actors', () => {
    expect(tenantAdministrationEntries(null, text, '')).toEqual([]);
    expect(tenantAdministrationEntries(sessionFixture, text, '')).toEqual([]);
    expect(tenantAdministrationEntries({ ...actor, roles: ['admin'] }, text, '')).toEqual([]);
  });
});
