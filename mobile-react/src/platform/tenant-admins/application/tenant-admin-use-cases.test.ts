import type { TenantAdminRepository } from '../domain/repositories/tenant-admin-repository';
import type { TenantAdminRequest } from '../domain/models/tenant-admin';
import { createTenantAdminUseCases } from './tenant-admin-use-cases';

const request: TenantAdminRequest = {
  firstName: 'Admin',
  lastName: 'User',
  userName: 'admin.user',
  email: 'admin@example.com',
  isDisabled: false,
  tenantIds: ['tenant-1'],
  defaultTenantId: 'tenant-1',
};

function repositoryMock(): jest.Mocked<TenantAdminRepository> {
  return {
    getAll: jest.fn(),
    getPage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
  };
}

describe('tenant admin application use cases', () => {
  it('delegates reads and chooses create or update for save', async () => {
    const repository = repositoryMock();
    repository.getAll.mockResolvedValue([]);
    repository.create.mockResolvedValue({} as never);
    repository.update.mockResolvedValue({} as never);
    const useCases = createTenantAdminUseCases(repository);

    await expect(useCases.getAll()).resolves.toEqual([]);
    await useCases.save({ id: null, request });
    await useCases.save({ id: 'admin-1', request });

    expect(repository.create).toHaveBeenCalledWith(request);
    expect(repository.update).toHaveBeenCalledWith('admin-1', request);
  });

  it('preserves archive and restore operations', async () => {
    const repository = repositoryMock();
    repository.archive.mockResolvedValue(undefined);
    repository.restore.mockResolvedValue({} as never);
    const useCases = createTenantAdminUseCases(repository);

    await useCases.archive('admin-1');
    await useCases.restore('admin-1');

    expect(repository.archive).toHaveBeenCalledWith('admin-1');
    expect(repository.restore).toHaveBeenCalledWith('admin-1');
  });
});
