import type { AdministrationRemoteDataSource } from '../remote/administration-remote-data-source';
import { DefaultAdministrationRepository } from './default-administration-repository';

function remoteMock(): jest.Mocked<AdministrationRemoteDataSource> {
  return {
    getUsersPage: jest.fn(),
    getUsers: jest.fn(),
    createUser: jest.fn(),
    getCompanyOptions: jest.fn(),
    getRoles: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    toggleRole: jest.fn(),
    getRoleClaims: jest.fn(),
    updateRoleClaims: jest.fn(),
    getInvitations: jest.fn(),
    createInvitation: jest.fn(),
    resendInvitation: jest.fn(),
    revokeInvitation: jest.fn(),
    updateUser: jest.fn(),
    changeUserPassword: jest.fn(),
    toggleUser: jest.fn(),
    unlockUser: jest.fn(),
    archiveUser: jest.fn(),
    restoreUser: jest.fn(),
    revokeUserSessions: jest.fn(),
  };
}

describe('DefaultAdministrationRepository', () => {
  it('delegates remote operations while online', async () => {
    const remote = remoteMock();
    remote.getUsers.mockResolvedValue([]);
    const repository = new DefaultAdministrationRepository(remote, () => true);

    await expect(repository.getUsers()).resolves.toEqual([]);
    await repository.toggleUser('user-1');

    expect(remote.getUsers).toHaveBeenCalledTimes(1);
    expect(remote.toggleUser).toHaveBeenCalledWith('user-1');
  });

  it('fails closed offline and does not defer security writes', () => {
    const remote = remoteMock();
    const repository = new DefaultAdministrationRepository(remote, () => false);

    expect(() => repository.getUsers()).toThrow('requires an internet connection');
    expect(() => repository.revokeUserSessions('user-1')).toThrow(
      'requires an internet connection',
    );
    expect(remote.getUsers).not.toHaveBeenCalled();
    expect(remote.revokeUserSessions).not.toHaveBeenCalled();
  });
});
