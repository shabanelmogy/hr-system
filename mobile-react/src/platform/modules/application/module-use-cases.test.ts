import type { ModuleRepository } from '../domain/repositories/module-repository';
import { createModuleUseCases } from './module-use-cases';

describe('module application use cases', () => {
  it('delegates accessible, installed, and tenant entitlement reads through the repository port', async () => {
    const repository: jest.Mocked<ModuleRepository> = {
      getAccessible: jest.fn().mockResolvedValue([]),
      getInstalled: jest.fn().mockResolvedValue([]),
      getTenantEntitlements: jest.fn().mockResolvedValue([]),
    };
    const useCases = createModuleUseCases(repository);

    await expect(useCases.getAccessible()).resolves.toEqual([]);
    await expect(useCases.getInstalled()).resolves.toEqual([]);
    await expect(useCases.getTenantEntitlements()).resolves.toEqual([]);
    expect(repository.getAccessible).toHaveBeenCalledTimes(1);
    expect(repository.getInstalled).toHaveBeenCalledTimes(1);
    expect(repository.getTenantEntitlements).toHaveBeenCalledTimes(1);
  });
});
