import type { AddressTypeRepository } from '../domain/repositories/address-type-repository';
import { createAddressTypeUseCases } from './address-type-use-cases';

function createRepositoryMock(): jest.Mocked<AddressTypeRepository> {
  return {
    getPage: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    bulkArchive: jest.fn(),
    bulkCreate: jest.fn(),
  };
}

describe('address type application use cases', () => {
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
    repository.getPage.mockResolvedValue(page);
    const useCases = createAddressTypeUseCases(repository);
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

    await expect(useCases.getPage(query)).resolves.toBe(page);
    expect(repository.getPage).toHaveBeenCalledWith(query);
  });

  it('normalizes writes before invoking the repository', async () => {
    const repository = createRepositoryMock();
    const detail = {
      id: 7,
      nameAr: 'منزل',
      nameEn: 'Home',
      createdOn: '2026-08-20T10:00:00Z',
      updatedOn: null,
      isDeleted: false,
    };
    repository.create.mockResolvedValue(detail);
    repository.update.mockResolvedValue(detail);
    repository.bulkCreate.mockResolvedValue({ createdCount: 1 });
    const useCases = createAddressTypeUseCases(repository);
    const request = { nameAr: ' منزل ', nameEn: ' Home ' };
    const normalized = { nameAr: 'منزل', nameEn: 'Home' };

    await useCases.save({ id: null, request });
    await useCases.save({ id: 7, request });
    await useCases.bulkCreate([request]);

    expect(repository.create).toHaveBeenCalledWith(normalized);
    expect(repository.update).toHaveBeenCalledWith(7, normalized);
    expect(repository.bulkCreate).toHaveBeenCalledWith([normalized]);
  });
});
