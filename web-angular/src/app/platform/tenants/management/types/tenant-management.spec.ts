import {
  defaultTenantQuery,
  parseTenantDetail,
  parseTenantPage,
  tenantQueryParameters,
  tenantSuperAdminAllowed,
} from './tenant';

const tenant = {
  id: 'tenant-1',
  identifier: 'ACME',
  name: 'Acme',
  isActive: true,
  subscriptionStatus: 'active',
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.000Z',
  planName: 'Business',
  maxAdmins: 2,
  maxUsers: 10,
  adminCount: 1,
  userCount: 3,
  totalUserCount: 4,
  companyCount: 1,
  billingEmail: 'billing@example.test',
  contactName: 'Alex',
  contactPhone: '+201000000000',
  notes: null,
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null,
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
  purgeScheduledOn: null,
  rowVersion: 'AQID',
  entitlements: [{ moduleCode: 'hr', submoduleCodes: ['basic-data'] }],
};

describe('Tenant management transport contract', () => {
  it('serializes only the retained page query and preserves its defaults', () => {
    expect(defaultTenantQuery).toMatchObject({
      pageNumber: 1,
      pageSize: 10,
      columnName: 'name',
      operation: 'Contains',
      sortDirection: 'ASC',
      searchValue: '',
      includeArchived: false,
    });
    expect(tenantQueryParameters({ ...defaultTenantQuery, searchValue: ' Acme ' }).params).toEqual({
      pageNumber: '1',
      pageSize: '10',
      columnName: 'name',
      operation: 'Contains',
      sortDirection: 'ASC',
      includeArchived: 'false',
      searchValue: ' Acme ',
    });
  });

  it('accepts the exact response shape but rejects stale or inconsistent server pages', () => {
    const page = {
      items: [tenant],
      metaData: {
        currentPage: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    };
    expect(parseTenantPage(page, defaultTenantQuery).items[0]?.id).toBe('tenant-1');
    expect(() =>
      parseTenantPage({ ...page, items: [tenant, tenant] }, defaultTenantQuery),
    ).toThrow();
    expect(() =>
      parseTenantPage(
        { ...page, metaData: { ...page.metaData, totalCount: 11, totalPages: 1 } },
        defaultTenantQuery,
      ),
    ).toThrow();
    expect(() => parseTenantDetail({ ...tenant, rowVersion: '' })).toThrow();
  });

  it('accepts response usage that exceeds a configured limit', () => {
    const overCapacityTenant = { ...tenant, adminCount: 3, userCount: 12 };
    const page = {
      items: [overCapacityTenant],
      metaData: {
        currentPage: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    };

    expect(parseTenantDetail(overCapacityTenant).adminCount).toBe(3);
    expect(parseTenantPage(page, defaultTenantQuery).items[0]?.userCount).toBe(12);
  });

  it('accepts only the existing super_admin role authority', () => {
    expect(tenantSuperAdminAllowed({ roles: ['super_admin'] })).toBe(true);
    expect(tenantSuperAdminAllowed({ roles: ['admin'] })).toBe(false);
    expect(tenantSuperAdminAllowed(null)).toBe(false);
  });
});
