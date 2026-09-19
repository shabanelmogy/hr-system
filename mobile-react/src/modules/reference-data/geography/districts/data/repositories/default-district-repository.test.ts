import type { DistrictRemoteDataSource } from '../remote/district-remote-data-source';
import { DefaultDistrictRepository } from './default-district-repository';

function remoteMock(): jest.Mocked<DistrictRemoteDataSource> {
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

describe('DefaultDistrictRepository', () => {
  it('delegates online reads', async () => {
    const remote = remoteMock();
    remote.getLookup.mockResolvedValue([]);
    const repository = new DefaultDistrictRepository(remote, () => true);

    await expect(repository.getLookup()).resolves.toEqual([]);
    expect(remote.getLookup).toHaveBeenCalledTimes(1);
  });

  it('fails closed while offline and never queues a write', async () => {
    const remote = remoteMock();
    const repository = new DefaultDistrictRepository(remote, () => false);

    await expect(repository.archive(7)).rejects.toThrow('requires an internet connection');
    expect(remote.archive).not.toHaveBeenCalled();
  });
});
