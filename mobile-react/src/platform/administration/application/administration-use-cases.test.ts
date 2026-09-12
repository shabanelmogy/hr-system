import type { AdministrationRepository } from '../domain/repositories/administration-repository';
import { createAdministrationUseCases } from './administration-use-cases';

function repositoryMock(): jest.Mocked<AdministrationRepository> {
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

describe('administration application use cases', () => {
  it('preserves role create/update selection', async () => {
    const repository = repositoryMock();
    repository.createRole.mockResolvedValue({} as never);
    const useCases = createAdministrationUseCases(repository);

    await useCases.saveRole({ id: null, request: { name: 'Auditor' } });
    await useCases.saveRole({
      id: 'role-1',
      request: { id: 'role-1', name: 'Auditor' },
    });

    expect(repository.createRole).toHaveBeenCalledWith({ name: 'Auditor' });
    expect(repository.updateRole).toHaveBeenCalledWith({ id: 'role-1', name: 'Auditor' });
  });

  it('creates an invitation for new managed users and updates existing users sequentially', async () => {
    const repository = repositoryMock();
    repository.createInvitation.mockResolvedValue({} as never);
    const useCases = createAdministrationUseCases(repository);
    const request = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      userName: 'ada',
      email: 'ada@example.com',
      roles: ['User'],
      companyIds: [1],
      defaultCompanyId: 1,
    };

    await useCases.saveManagedUser({ id: null, request });
    await useCases.saveManagedUser({
      id: 'user-1',
      request,
      password: { newPassword: 'NewPassword1!', confirmPassword: 'NewPassword1!' },
    });

    expect(repository.createInvitation).toHaveBeenCalledWith(request);
    expect(repository.updateUser).toHaveBeenCalledWith('user-1', request);
    expect(repository.changeUserPassword).toHaveBeenCalledWith('user-1', {
      newPassword: 'NewPassword1!',
      confirmPassword: 'NewPassword1!',
    });
  });
});
