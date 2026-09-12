import type { CountryRepository } from '../domain/repositories/country-repository';
import { createCountryUseCases } from './country-use-cases';

function createRepositoryMock(): jest.Mocked<CountryRepository> {
  return {
    getPage: jest.fn(),
    getLookup: jest.fn(),
    getById: jest.fn(),
    getWithStates: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
  };
}

describe('country application use cases', () => {
  it('delegates reads through the repository port', async () => {
    const repository = createRepositoryMock();
    const page = {
      items: [],
      metaData: {
        currentPage: 1,
        totalPages: 0,
        pageSize: 5,
        pageNumber: 1,
        totalCount: 0,
        hasPrev: false,
        hasNext: false,
      },
    };
    const result = { value: page, source: 'remote' as const, cachedAt: '2026-09-09T12:00:00Z' };
    repository.getPage.mockResolvedValue(result);
    const useCases = createCountryUseCases(repository);
    const query = {
      pageNumber: 1,
      pageSize: 5,
      search: '',
      searchField: 'all' as const,
      searchOperator: 'contains' as const,
      status: 'active' as const,
      sortBy: 'createdOn' as const,
      sortDirection: 'desc' as const,
    };

    await expect(useCases.getPage(query)).resolves.toBe(result);
    expect(repository.getPage).toHaveBeenCalledWith(query);
  });

  it('normalizes writes before invoking the repository', async () => {
    const repository = createRepositoryMock();
    const detail = {
      id: 7,
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: 'EG',
      alpha3Code: 'EGY',
      phoneCode: '+20',
      currencyCode: 'EGP',
      createdOn: '2026-08-20T10:00:00Z',
      updatedOn: null,
      isDeleted: false,
    };
    repository.create.mockResolvedValue(detail);
    repository.update.mockResolvedValue(detail);
    repository.bulkCreate.mockResolvedValue({ createdCount: 1 });
    const useCases = createCountryUseCases(repository);
    const request = {
      nameAr: ' مصر ',
      nameEn: ' Egypt ',
      alpha2Code: 'eg',
      alpha3Code: 'egy',
      phoneCode: ' +20 ',
      currencyCode: 'egp',
    };
    const normalized = {
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: 'EG',
      alpha3Code: 'EGY',
      phoneCode: '+20',
      currencyCode: 'EGP',
    };

    await useCases.save({ id: null, request });
    await useCases.save({ id: 7, request });
    await useCases.bulkCreate([request]);

    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(7, normalized);
    expect(repository.bulkCreate).toHaveBeenCalledWith([normalized]);
  });
});
