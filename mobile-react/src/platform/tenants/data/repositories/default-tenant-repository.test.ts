import type { TenantRemoteDataSource } from '../remote/tenant-remote-data-source';
import { DefaultTenantRepository } from './default-tenant-repository';

function remoteMock(): jest.Mocked<TenantRemoteDataSource> {
  return {
    getAll: jest.fn(),
    getPage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
  };
}

describe('DefaultTenantRepository', () => {
  it('delegates directly to remote while online', async () => {
    const remote = remoteMock();
    remote.getAll.mockResolvedValue([]);
    remote.restore.mockResolvedValue({} as never);
    const repository = new DefaultTenantRepository(remote, () => true);

    await expect(repository.getAll()).resolves.toEqual([]);
    await repository.restore('tenant-1', 'rv-1');

    expect(remote.getAll).toHaveBeenCalledTimes(1);
    expect(remote.restore).toHaveBeenCalledWith('tenant-1', 'rv-1');
  });

  it('fails closed offline and never queues writes', () => {
    const remote = remoteMock();
    const repository = new DefaultTenantRepository(remote, () => false);

    expect(() => repository.getAll()).toThrow('requires an internet connection');
    expect(() => repository.restore('tenant-1', 'rv-1')).toThrow(
      'requires an internet connection',
    );
    expect(remote.getAll).not.toHaveBeenCalled();
    expect(remote.restore).not.toHaveBeenCalled();
  });
});
