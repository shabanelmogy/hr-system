import type { TenantAdminRemoteDataSource } from '../remote/tenant-admin-remote-data-source';
import { DefaultTenantAdminRepository } from './default-tenant-admin-repository';

function remoteMock(): jest.Mocked<TenantAdminRemoteDataSource> {
  return {
    getAll: jest.fn(),
    getPage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
  };
}

describe('DefaultTenantAdminRepository', () => {
  it('delegates reads and writes directly to remote while online', async () => {
    const remote = remoteMock();
    remote.getAll.mockResolvedValue([]);
    remote.archive.mockResolvedValue(undefined);
    const repository = new DefaultTenantAdminRepository(remote, () => true);

    await expect(repository.getAll()).resolves.toEqual([]);
    await repository.archive('admin-1');

    expect(remote.getAll).toHaveBeenCalledTimes(1);
    expect(remote.archive).toHaveBeenCalledWith('admin-1');
  });

  it('fails closed while offline without creating an offline write', () => {
    const remote = remoteMock();
    const repository = new DefaultTenantAdminRepository(remote, () => false);

    expect(() => repository.getAll()).toThrow('requires an internet connection');
    expect(() => repository.restore('admin-1')).toThrow('requires an internet connection');
    expect(remote.getAll).not.toHaveBeenCalled();
    expect(remote.restore).not.toHaveBeenCalled();
  });
});
