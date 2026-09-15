import type { ModuleRemoteDataSource } from '../remote/module-remote-data-source';
import { DefaultModuleRepository } from './default-module-repository';

function remoteMock(): jest.Mocked<ModuleRemoteDataSource> {
  return {
    getAccessible: jest.fn(),
    getInstalled: jest.fn(),
    getTenantEntitlements: jest.fn(),
  };
}

describe('DefaultModuleRepository', () => {
  it('delegates reads while online', async () => {
    const remote = remoteMock();
    remote.getAccessible.mockResolvedValue([]);
    const repository = new DefaultModuleRepository(remote, () => true);

    await expect(repository.getAccessible()).resolves.toEqual([]);
    expect(remote.getAccessible).toHaveBeenCalledTimes(1);

    remote.getTenantEntitlements.mockResolvedValue([]);
    await expect(repository.getTenantEntitlements()).resolves.toEqual([]);
    expect(remote.getTenantEntitlements).toHaveBeenCalledTimes(1);
  });

  it('fails closed while offline', () => {
    const remote = remoteMock();
    const repository = new DefaultModuleRepository(remote, () => false);

    expect(() => repository.getInstalled()).toThrow('requires an internet connection');
    expect(remote.getInstalled).not.toHaveBeenCalled();
  });
});
