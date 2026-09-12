import { apiService } from '@/src/core/api';
import type {
  TenantManagementRequest,
  TenantManagementResponse,
} from '../../domain/models/tenant';
import { tenantRemoteDataSource } from './tenant-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const tenant: TenantManagementResponse = {
  id: 'tenant-1',
  identifier: 'TEN-1',
  name: 'Tenant 1',
  isActive: true,
  subscriptionStatus: 'active',
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.000Z',
  planName: 'Professional',
  maxAdmins: 2,
  maxUsers: 20,
  adminCount: 1,
  userCount: 5,
  totalUserCount: 6,
  companyCount: 1,
  billingEmail: 'billing@example.com',
  contactName: 'Owner',
  contactPhone: null,
  notes: null,
  createdOn: '2026-01-01T00:00:00.000Z',
  updatedOn: null,
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
  purgeScheduledOn: null,
  rowVersion: 'rv-1',
  entitlements: [{ moduleCode: 'hr', submoduleCodes: ['recruitment'] }],
};

const request: TenantManagementRequest = {
  identifier: 'TEN-1',
  name: 'Tenant 1',
  isActive: true,
  subscriptionStatus: 'active',
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.000Z',
  planName: 'Professional',
  maxAdmins: 2,
  maxUsers: 20,
  billingEmail: 'billing@example.com',
  contactName: 'Owner',
  contactPhone: null,
  notes: null,
};

describe('tenant remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('preserves list and page endpoints and response entitlements', async () => {
    (apiService.get as jest.Mock)
      .mockResolvedValueOnce([tenant])
      .mockResolvedValueOnce({
        items: [tenant],
        metaData: {
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          pageNumber: 1,
          totalCount: 1,
          hasPrev: false,
          hasNext: false,
        },
      });

    await expect(tenantRemoteDataSource.getAll()).resolves.toEqual([tenant]);
    await tenantRemoteDataSource.getPage({ pageNumber: 1, pageSize: 10 });

    expect(apiService.get).toHaveBeenNthCalledWith(1, 'tenants/getAll');
    expect(apiService.get).toHaveBeenNthCalledWith(2, 'tenants/getPage?pageNumber=1&pageSize=10');
  });

  it('preserves create, update, archive and restore wire contracts', async () => {
    (apiService.post as jest.Mock).mockResolvedValue(tenant);
    (apiService.put as jest.Mock).mockResolvedValue(tenant);

    await tenantRemoteDataSource.create(request);
    await tenantRemoteDataSource.update('tenant-1', request);
    await tenantRemoteDataSource.archive('tenant-1', {
      reason: 'closed',
      rowVersion: 'rv-1',
      purgeScheduledOn: null,
    });
    await tenantRemoteDataSource.restore('tenant-1', 'rv-2');

    expect(apiService.post).toHaveBeenNthCalledWith(1, 'tenants/create', request);
    expect(apiService.put).toHaveBeenCalledWith('tenants/update/tenant-1', request);
    expect(apiService.post).toHaveBeenNthCalledWith(2, 'tenants/archive/tenant-1', {
      reason: 'closed',
      rowVersion: 'rv-1',
      purgeScheduledOn: null,
    });
    expect(apiService.post).toHaveBeenNthCalledWith(3, 'tenants/restore/tenant-1', {
      rowVersion: 'rv-2',
    });
  });

  it('rejects malformed rows at the remote boundary', async () => {
    (apiService.get as jest.Mock).mockResolvedValue([{ id: 'tenant-1' }]);
    await expect(tenantRemoteDataSource.getAll()).rejects.toThrow();
  });
});
