import type { TenantAdmin } from './types/tenant-admin';
export const adminFixture: TenantAdmin = {
  id: 'admin-alpha',
  firstName: 'Ali',
  lastName: 'Hassan',
  userName: 'ali',
  email: 'ali@example.test',
  isDisabled: false,
  isLocked: false,
  defaultTenantId: 't',
  tenants: [{ id: 't', identifier: 'alpha', name: 'Alpha', isDefault: true }],
  companyIds: [1],
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
};
