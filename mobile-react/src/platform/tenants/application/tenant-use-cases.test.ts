import type { TenantManagementRequest } from '../domain/models/tenant';
import type { TenantRepository } from '../domain/repositories/tenant-repository';
import { createTenantUseCases } from './tenant-use-cases';

const request: TenantManagementRequest = {
  identifier: 'tenant-1',
  name: 'Tenant 1',
  isActive: true,
  subscriptionStatus: 'active',
  subscriptionStartedOn: '2026-01-01T00:00:00.000Z',
  subscriptionEndsOn: '2026-12-31T23:59:59.000Z',
  planName: 'Professional',
  maxAdmins: 2,
  maxUsers: 20,
  billingEmail: null,
  contactName: null,
  contactPhone: null,
  notes: null,
};

function repositoryMock(): jest.Mocked<TenantRepository> {
  return {
    getAll: jest.fn(),
    getPage: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
  };
}

describe('tenant application use cases', () => {
  it('delegates reads and selects create/update for save', async () => {
    const repository = repositoryMock();
    repository.getAll.mockResolvedValue([]);
    repository.create.mockResolvedValue({} as never);
    repository.update.mockResolvedValue({} as never);
    const useCases = createTenantUseCases(repository);

    await expect(useCases.getAll()).resolves.toEqual([]);
    await useCases.save({ id: null, request });
    await useCases.save({ id: 'tenant-1', request });

    expect(repository.create).toHaveBeenCalledWith(request);
    expect(repository.update).toHaveBeenCalledWith('tenant-1', request);
  });

  it('preserves row-versioned archive and restore operations', async () => {
    const repository = repositoryMock();
    repository.archive.mockResolvedValue({} as never);
    repository.restore.mockResolvedValue({} as never);
    const useCases = createTenantUseCases(repository);
    const archiveRequest = { reason: 'closed', rowVersion: 'rv-1' };

    await useCases.archive('tenant-1', archiveRequest);
    await useCases.restore('tenant-1', 'rv-2');

    expect(repository.archive).toHaveBeenCalledWith('tenant-1', archiveRequest);
    expect(repository.restore).toHaveBeenCalledWith('tenant-1', 'rv-2');
  });
});
