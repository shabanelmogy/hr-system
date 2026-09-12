import type { OrganizationalStructureRemoteDataSource } from '../remote/organizational-structure-remote-data-source';
import { DefaultOrganizationalStructureRepository } from './default-organizational-structure-repository';

function createRemoteMock(): jest.Mocked<OrganizationalStructureRemoteDataSource> {
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

describe('default organizational structure repository', () => {
  it('keeps writes online-authoritative by delegating directly to the remote source', async () => {
    const remote = createRemoteMock();
    const repository = new DefaultOrganizationalStructureRepository(remote);
    const request = { code: 'BR-1', nameEn: 'Branch', nameAr: 'فرع' };
    remote.create.mockResolvedValue({ id: 1 } as never);
    remote.bulkCreate.mockResolvedValue({ createdCount: 1 });
    remote.archive.mockResolvedValue(undefined);

    await repository.create('branches', request);
    await repository.bulkCreate('branches', [request]);
    await repository.archive('branches', 1);

    expect(remote.create).toHaveBeenCalledWith('branches', request);
    expect(remote.bulkCreate).toHaveBeenCalledWith('branches', [request]);
    expect(remote.archive).toHaveBeenCalledWith('branches', 1);
  });
});
