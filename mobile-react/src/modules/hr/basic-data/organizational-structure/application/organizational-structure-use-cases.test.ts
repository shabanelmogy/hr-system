import type { OrganizationalStructureRepository } from '../domain/repositories/organizational-structure-repository';
import { createOrganizationalStructureUseCases } from './organizational-structure-use-cases';

function createRepositoryMock(): jest.Mocked<OrganizationalStructureRepository> {
  return {
    getPage: jest.fn(),
    getLookup: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    approveJobDescription: jest.fn(),
    rejectJobDescription: jest.fn(),
    getChangeLogs: jest.fn(),
  };
}

describe('organizational structure application use cases', () => {
  it('delegates lookup reads through the repository port', async () => {
    const repository = createRepositoryMock();
    const lookup = [{ id: 4, code: 'BR-04', nameEn: 'Cairo', nameAr: 'القاهرة' }];
    repository.getLookup.mockResolvedValue(lookup);
    const useCases = createOrganizationalStructureUseCases(repository);

    await expect(useCases.getLookup('branches', 12)).resolves.toBe(lookup);
    expect(repository.getLookup).toHaveBeenCalledWith('branches', 12);
  });

  it('normalizes create, update, and bulk writes before repository delegation', async () => {
    const repository = createRepositoryMock();
    repository.create.mockResolvedValue({} as never);
    repository.update.mockResolvedValue({} as never);
    repository.bulkCreate.mockResolvedValue({ createdCount: 1 });
    const useCases = createOrganizationalStructureUseCases(repository);
    const request = {
      code: ' dep-1 ',
      nameEn: ' Finance ',
      nameAr: ' المالية ',
      costCenterCode: ' fin ',
    };
    const normalized = {
      code: 'DEP-1',
      nameEn: 'Finance',
      nameAr: 'المالية',
      costCenterCode: 'FIN',
    };

    await useCases.save({ resource: 'departments', id: null, request });
    await useCases.save({ resource: 'departments', id: 7, request });
    await useCases.bulkCreate('departments', [request]);

    expect(repository.create).toHaveBeenCalledWith('departments', expect.objectContaining(normalized));
    expect(repository.update).toHaveBeenCalledWith('departments', 7, expect.objectContaining(normalized));
    expect(repository.bulkCreate).toHaveBeenCalledWith('departments', [expect.objectContaining(normalized)]);
  });
});
