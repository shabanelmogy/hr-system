import type { CountryLocalDataSource } from '../local/country-local-data-source';
import type { CountryRemoteDataSource } from '../remote/country-remote-data-source';
import { DefaultCountryRepository } from './default-country-repository';

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
const cachedAt = '2026-09-09T10:00:00.000Z';
const remoteReadAt = '2026-09-09T12:00:00.000Z';
const cachedPage = { value: page, cachedAt };
const offlineReadEnabled = {
  enabled: () => true,
  isFresh: () => true,
  now: () => remoteReadAt,
};

function remoteMock(): jest.Mocked<CountryRemoteDataSource> {
  return {
    getPage: jest.fn(), getLookup: jest.fn(), getById: jest.fn(), getWithStates: jest.fn(),
    create: jest.fn(), update: jest.fn(), archive: jest.fn(), restore: jest.fn(),
    bulkArchive: jest.fn(), bulkCreate: jest.fn(),
  };
}

function localMock(): jest.Mocked<CountryLocalDataSource> {
  return {
    getPage: jest.fn(), putPage: jest.fn(), getLookup: jest.fn(), putLookup: jest.fn(),
    getById: jest.fn(), putById: jest.fn(), getWithStates: jest.fn(), putWithStates: jest.fn(),
    invalidateReads: jest.fn(),
  };
}

describe('DefaultCountryRepository', () => {
  it('serves remote reads and refreshes the local cache best-effort', async () => {
    const remote = remoteMock();
    const local = localMock();
    remote.getPage.mockResolvedValue(page);
    local.putPage.mockRejectedValue(new Error('cache unavailable'));
    const repository = new DefaultCountryRepository(remote, local, () => true, () => true, offlineReadEnabled);

    await expect(repository.getPage(query)).resolves.toEqual({
      value: page,
      source: 'remote',
      cachedAt: remoteReadAt,
    });
    expect(local.putPage).toHaveBeenCalledWith(query, page);
    expect(local.getPage).not.toHaveBeenCalled();
  });

  it('falls back to a cached read only when the remote read fails', async () => {
    const remote = remoteMock();
    const local = localMock();
    remote.getPage.mockRejectedValue(new Error('offline'));
    local.getPage.mockResolvedValue(cachedPage);
    const repository = new DefaultCountryRepository(remote, local, () => true, () => true, offlineReadEnabled);

    await expect(repository.getPage(query)).resolves.toEqual({
      value: page,
      source: 'cache',
      cachedAt,
    });
  });

  it('preserves the remote error when no cached read exists', async () => {
    const remote = remoteMock();
    const local = localMock();
    const error = new Error('offline');
    remote.getPage.mockRejectedValue(error);
    local.getPage.mockResolvedValue(null);
    const repository = new DefaultCountryRepository(remote, local, () => true, () => true, offlineReadEnabled);

    await expect(repository.getPage(query)).rejects.toBe(error);
  });

  it('keeps writes online-authoritative and only invalidates local reads after success', async () => {
    const remote = remoteMock();
    const local = localMock();
    remote.archive.mockResolvedValue(undefined);
    const repository = new DefaultCountryRepository(remote, local, () => true);

    await repository.archive(7);
    expect(remote.archive).toHaveBeenCalledWith(7);
    expect(local.invalidateReads).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    const error = new Error('network uncertain');
    remote.archive.mockRejectedValue(error);
    await expect(repository.archive(7)).rejects.toBe(error);
    expect(local.invalidateReads).not.toHaveBeenCalled();
  });

  it('fails closed for remote contract/business errors instead of masking them with cache', async () => {
    const remote = remoteMock();
    const local = localMock();
    const error = new Error('invalid response contract');
    remote.getPage.mockRejectedValue(error);
    local.getPage.mockResolvedValue(cachedPage);
    const repository = new DefaultCountryRepository(remote, local, () => false, () => true, offlineReadEnabled);

    await expect(repository.getPage(query)).rejects.toBe(error);
    expect(local.getPage).not.toHaveBeenCalled();
  });

  it('reads directly from a fresh local cache while offline when cached reads are enabled', async () => {
    const remote = remoteMock();
    const local = localMock();
    local.getPage.mockResolvedValue(cachedPage);
    const repository = new DefaultCountryRepository(remote, local, () => true, () => false, offlineReadEnabled);

    await expect(repository.getPage(query)).resolves.toEqual({
      value: page,
      source: 'cache',
      cachedAt,
    });
    expect(remote.getPage).not.toHaveBeenCalled();
  });

  it('requires a connection while offline cached reads are disabled', async () => {
    const remote = remoteMock();
    const local = localMock();
    local.getPage.mockResolvedValue(cachedPage);
    const repository = new DefaultCountryRepository(remote, local, () => true, () => false);

    await expect(repository.getPage(query)).rejects.toThrow('cached reads are disabled');
    expect(local.getPage).not.toHaveBeenCalled();
    expect(remote.getPage).not.toHaveBeenCalled();
  });

  it('rejects expired cached data while offline', async () => {
    const remote = remoteMock();
    const local = localMock();
    local.getPage.mockResolvedValue(cachedPage);
    const repository = new DefaultCountryRepository(
      remote,
      local,
      () => true,
      () => false,
      { enabled: () => true, isFresh: () => false },
    );

    await expect(repository.getPage(query)).rejects.toThrow('older than the allowed offline-read window');
  });

  it('does not persist durable business cache while cached reads are disabled', async () => {
    const remote = remoteMock();
    const local = localMock();
    remote.getPage.mockResolvedValue(page);
    const repository = new DefaultCountryRepository(remote, local, () => true);

    await expect(repository.getPage(query)).resolves.toMatchObject({ value: page, source: 'remote' });
    expect(local.putPage).not.toHaveBeenCalled();
  });

  it('rejects writes while offline instead of queueing an unsafe replay', async () => {
    const remote = remoteMock();
    const local = localMock();
    const repository = new DefaultCountryRepository(remote, local, () => true, () => false);

    await expect(repository.archive(7)).rejects.toThrow('requires an internet connection');
    expect(remote.archive).not.toHaveBeenCalled();
  });
});
