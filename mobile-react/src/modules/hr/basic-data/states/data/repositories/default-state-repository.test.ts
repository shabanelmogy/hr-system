import type { StateRemoteDataSource } from '../remote/state-remote-data-source';
import { DefaultStateRepository } from './default-state-repository';

function remoteMock(): jest.Mocked<StateRemoteDataSource> {
  return {
    getPage: jest.fn(), getLookup: jest.fn(), getByCountry: jest.fn(), getById: jest.fn(),
    getWithDistricts: jest.fn(), create: jest.fn(), update: jest.fn(), archive: jest.fn(),
    restore: jest.fn(), bulkArchive: jest.fn(), bulkCreate: jest.fn(),
  };
}

describe('DefaultStateRepository', () => {
  it('delegates lookups through the remote data source', async () => {
    const remote = remoteMock();
    remote.getLookup.mockResolvedValue([{ id: 11, nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 }]);
    const repository = new DefaultStateRepository(remote);

    await expect(repository.getLookup(7)).resolves.toHaveLength(1);
    expect(remote.getLookup).toHaveBeenCalledWith(7);
  });

  it('keeps writes online-authoritative with no local/outbox behavior', async () => {
    const remote = remoteMock();
    remote.archive.mockResolvedValue(undefined);
    const repository = new DefaultStateRepository(remote);

    await repository.archive(11);
    expect(remote.archive).toHaveBeenCalledWith(11);
  });
});
