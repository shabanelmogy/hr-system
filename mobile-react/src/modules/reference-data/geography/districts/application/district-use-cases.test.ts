import type { DistrictRepository } from '../domain/repositories/district-repository';
import { createDistrictUseCases } from './district-use-cases';

function repositoryMock(): jest.Mocked<DistrictRepository> {
  return {
    getPage: jest.fn(),
    getLookup: jest.fn(),
    getByState: jest.fn(),
    getById: jest.fn(),
    getWithAddresses: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
  };
}

describe('district application use cases', () => {
  it('delegates reads through the repository port', async () => {
    const repository = repositoryMock();
    repository.getLookup.mockResolvedValue([]);
    const useCases = createDistrictUseCases(repository);

    await expect(useCases.getLookup(7)).resolves.toEqual([]);
    expect(repository.getLookup).toHaveBeenCalledWith(7);
  });

  it('normalizes create, update, and bulk-create writes before the repository', async () => {
    const repository = repositoryMock();
    const detail = {
      id: 1,
      nameAr: 'المعادي',
      nameEn: 'Maadi',
      code: 'MAA',
      stateId: 7,
      state: { id: 7, nameAr: 'القاهرة', nameEn: 'Cairo', isDeleted: false },
      createdOn: '2026-09-10T00:00:00Z',
      updatedOn: null,
      isDeleted: false,
    };
    repository.create.mockResolvedValue(detail);
    repository.update.mockResolvedValue(detail);
    repository.bulkCreate.mockResolvedValue({ createdCount: 1 });
    const useCases = createDistrictUseCases(repository);
    const raw = { nameAr: ' المعادي ', nameEn: ' Maadi ', code: 'maa', stateId: 7 };
    const normalized = { nameAr: 'المعادي', nameEn: 'Maadi', code: 'MAA', stateId: 7 };

    await useCases.save({ id: null, request: raw });
    await useCases.save({ id: 1, request: raw });
    await useCases.bulkCreate([raw]);

    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(1, normalized);
    expect(repository.bulkCreate).toHaveBeenCalledWith([normalized]);
  });
});
