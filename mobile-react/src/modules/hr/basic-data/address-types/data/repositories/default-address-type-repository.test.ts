import type { AddressTypeRemoteDataSource } from '../remote/address-type-remote-data-source';
import { DefaultAddressTypeRepository } from './default-address-type-repository';

function createRemoteMock(): jest.Mocked<AddressTypeRemoteDataSource> {
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

describe('DefaultAddressTypeRepository', () => {
  it('keeps reads remote-authoritative', async () => {
    const remote = createRemoteMock();
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
    remote.getPage.mockResolvedValue(page);
    const repository = new DefaultAddressTypeRepository(remote, () => false);
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

    await expect(repository.getPage(query)).resolves.toBe(page);
    expect(remote.getPage).toHaveBeenCalledWith(query);
  });

  it('blocks writes before reaching the remote source when offline', async () => {
    const remote = createRemoteMock();
    const repository = new DefaultAddressTypeRepository(remote, () => false);

    await expect(repository.create({ nameAr: 'منزل', nameEn: 'Home' }))
      .rejects.toThrow('requires an internet connection');
    expect(remote.create).not.toHaveBeenCalled();
  });

  it('delegates writes to the server when online', async () => {
    const remote = createRemoteMock();
    const detail = {
      id: 7,
      nameAr: 'منزل',
      nameEn: 'Home',
      createdOn: '2026-08-20T10:00:00Z',
      updatedOn: null,
      isDeleted: false,
    };
    remote.create.mockResolvedValue(detail);
    const repository = new DefaultAddressTypeRepository(remote, () => true);

    await expect(repository.create({ nameAr: 'منزل', nameEn: 'Home' })).resolves.toBe(detail);
    expect(remote.create).toHaveBeenCalledWith({ nameAr: 'منزل', nameEn: 'Home' });
  });
});
