import { parseTenantAdmin, parseTenantAdmins } from './tenant-admin';
const admin = {
  id: 'a',
  firstName: 'Ali',
  lastName: 'Hassan',
  userName: 'ali',
  email: 'ali@example.test',
  isDisabled: false,
  isLocked: false,
  defaultTenantId: 't',
  tenants: [{ id: 't', identifier: 'tenant', name: 'Tenant', isDefault: true }],
  companyIds: [1],
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
};
describe('Tenant administrator response contracts', () => {
  it('validates a nonempty default identity and its exact membership flag while retaining an unassigned snapshot', () => {
    expect(() => parseTenantAdmin({ ...admin, defaultTenantId: ' foreign ' })).toThrow();
    expect(() => parseTenantAdmin({ ...admin, defaultTenantId: 'foreign' })).toThrow();
    expect(() =>
      parseTenantAdmin({
        ...admin,
        tenants: admin.tenants.map((tenant) => ({ ...tenant, isDefault: false })),
      }),
    ).toThrow();
    expect(() => parseTenantAdmin({ ...admin, defaultTenantId: '' })).toThrow();
    expect(
      parseTenantAdmin({
        ...admin,
        defaultTenantId: '',
        tenants: admin.tenants.map((tenant) => ({ ...tenant, isDefault: false })),
      }).defaultTenantId,
    ).toBe('');
  });
  it('retains the complete nested snapshot without inventing a rowVersion', () => {
    expect(parseTenantAdmin(admin)).toEqual(admin);
    expect(parseTenantAdmin({ ...admin, tenants: [], defaultTenantId: '' }).tenants).toEqual([]);
    expect(parseTenantAdmins([])).toEqual([]);
  });
  it('rejects malformed booleans/lifecycle and duplicate account or assignment identities', () => {
    expect(() => parseTenantAdmin({ ...admin, isDisabled: 'false' })).toThrow();
    expect(() => parseTenantAdmin({ ...admin, companyIds: [0] })).toThrow();
    expect(() =>
      parseTenantAdmin({ ...admin, tenants: [...admin.tenants, ...admin.tenants] }),
    ).toThrow();
    expect(() => parseTenantAdmins([admin, admin])).toThrow();
    expect(() => parseTenantAdmin({ ...admin, lifecycleStatus: 'deleted' })).toThrow();
  });
});
