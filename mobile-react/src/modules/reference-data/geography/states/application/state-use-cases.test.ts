import type { StateRepository } from '../domain/repositories/state-repository';
import { createStateUseCases } from './state-use-cases';

function repositoryMock(): jest.Mocked<StateRepository> {
  return {
    getPage: jest.fn(), getLookup: jest.fn(), getByCountry: jest.fn(), getById: jest.fn(),
    getWithDistricts: jest.fn(), create: jest.fn(), update: jest.fn(), archive: jest.fn(),
    restore: jest.fn(), bulkArchive: jest.fn(), bulkCreate: jest.fn(),
  };
}

describe('state application use cases', () => {
  it('delegates repository-backed lookups', async () => {
    const repository = repositoryMock();
    repository.getLookup.mockResolvedValue([]);
    const useCases = createStateUseCases(repository);

    await useCases.getLookup(7);
    expect(repository.getLookup).toHaveBeenCalledWith(7);
  });

  it('normalizes save and bulk-create writes before the repository', async () => {
    const repository = repositoryMock();
    const detail = {
      id: 11, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7,
      country: { id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
      createdOn: '2026-08-24T00:00:00Z', updatedOn: null, isDeleted: false,
    };
    repository.create.mockResolvedValue(detail);
    repository.update.mockResolvedValue(detail);
    repository.bulkCreate.mockResolvedValue({ createdCount: 1 });
    const useCases = createStateUseCases(repository);
    const request = { nameAr: ' القاهرة ', nameEn: ' Cairo ', code: 'cai', countryId: 7 };
    const normalized = { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 };

    await useCases.save({ id: null, request });
    await useCases.save({ id: 11, request });
    await useCases.bulkCreate([request]);

    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(11, normalized);
    expect(repository.bulkCreate).toHaveBeenCalledWith([normalized]);
  });
});
