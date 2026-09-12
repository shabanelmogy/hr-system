import { apiService } from '@/src/core/api';
import type { TenantAdmin, TenantAdminRequest } from '../../domain/models/tenant-admin';
import { tenantAdminRemoteDataSource } from './tenant-admin-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: {
    delete: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const admin: TenantAdmin = {
  id: 'admin-1',
  firstName: 'Admin',
  lastName: 'User',
  userName: 'admin.user',
  email: 'admin@example.com',
  isDisabled: false,
  isLocked: false,
  defaultTenantId: 'tenant-1',
  tenants: [{ id: 'tenant-1', identifier: 'TEN-1', name: 'Tenant 1', isDefault: true }],
  companyIds: [1],
  lifecycleStatus: 'active',
  archivedOn: null,
  archiveReason: null,
};

const request: TenantAdminRequest = {
  firstName: 'Admin',
  lastName: 'User',
  userName: 'admin.user',
  email: 'admin@example.com',
  isDisabled: false,
  tenantIds: ['tenant-1'],
  defaultTenantId: 'tenant-1',
};

describe('tenant admin remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('preserves list and paged endpoints', async () => {
    (apiService.get as jest.Mock)
      .mockResolvedValueOnce([admin])
      .mockResolvedValueOnce({
        items: [admin],
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

    await expect(tenantAdminRemoteDataSource.getAll()).resolves.toEqual([admin]);
    await tenantAdminRemoteDataSource.getPage({
      pageNumber: 1,
      pageSize: 10,
      includeArchived: true,
    });

    expect(apiService.get).toHaveBeenNthCalledWith(1, 'tenantAdmins/getAll');
    expect(apiService.get).toHaveBeenNthCalledWith(
      2,
      'tenantAdmins/getPage?pageNumber=1&pageSize=10&includeArchived=true',
    );
  });

  it('preserves create, update, archive and restore endpoints', async () => {
    (apiService.post as jest.Mock).mockResolvedValue(admin);
    (apiService.put as jest.Mock).mockResolvedValue(admin);
    (apiService.delete as jest.Mock).mockResolvedValue(undefined);

    await tenantAdminRemoteDataSource.create(request);
    await tenantAdminRemoteDataSource.update(admin.id, request);
    await tenantAdminRemoteDataSource.archive(admin.id);
    await tenantAdminRemoteDataSource.restore(admin.id);

    expect(apiService.post).toHaveBeenNthCalledWith(1, 'tenantAdmins/create', request);
    expect(apiService.put).toHaveBeenCalledWith('tenantAdmins/update/admin-1', request);
    expect(apiService.delete).toHaveBeenCalledWith('tenantAdmins/delete/admin-1');
    expect(apiService.post).toHaveBeenNthCalledWith(
      2,
      'tenantAdmins/restore/admin-1',
      undefined,
    );
  });

  it('rejects malformed tenant admin responses at the transport boundary', async () => {
    (apiService.get as jest.Mock).mockResolvedValue([{ id: 'admin-1' }]);
    await expect(tenantAdminRemoteDataSource.getAll()).rejects.toThrow();
  });
});
