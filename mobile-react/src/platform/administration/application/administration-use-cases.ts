import type {
  ChangeManagedUserPasswordRequest,
  CreateRoleRequest,
  CreateUserInvitationRequest,
  UpdateManagedUserRequest,
  UpdateRoleRequest,
} from '../domain/models/administration';
import type { AdministrationRepository } from '../domain/repositories/administration-repository';

export type SaveManagedUserInput =
  | { id: null; request: CreateUserInvitationRequest }
  | {
      id: string;
      request: UpdateManagedUserRequest;
      password?: ChangeManagedUserPasswordRequest;
    };

export type SaveRoleInput =
  | { id: null; request: CreateRoleRequest }
  | { id: string; request: UpdateRoleRequest };

export function createAdministrationUseCases(repository: AdministrationRepository) {
  return {
    getUsersPage: repository.getUsersPage.bind(repository),
    getUsers: repository.getUsers.bind(repository),
    createUser: repository.createUser.bind(repository),
    getCompanyOptions: repository.getCompanyOptions.bind(repository),
    getRoles: repository.getRoles.bind(repository),
    saveRole: async (input: SaveRoleInput) => {
      if (input.id === null) {
        await repository.createRole(input.request);
        return;
      }
      await repository.updateRole(input.request);
    },
    toggleRole: repository.toggleRole.bind(repository),
    getRoleClaims: repository.getRoleClaims.bind(repository),
    updateRoleClaims: repository.updateRoleClaims.bind(repository),
    getInvitations: repository.getInvitations.bind(repository),
    saveManagedUser: async (input: SaveManagedUserInput) => {
      if (input.id === null) return repository.createInvitation(input.request);
      await repository.updateUser(input.id, input.request);
      if (input.password) await repository.changeUserPassword(input.id, input.password);
      return undefined;
    },
    resendInvitation: repository.resendInvitation.bind(repository),
    revokeInvitation: repository.revokeInvitation.bind(repository),
    toggleUser: repository.toggleUser.bind(repository),
    unlockUser: repository.unlockUser.bind(repository),
    archiveUser: repository.archiveUser.bind(repository),
    restoreUser: repository.restoreUser.bind(repository),
    revokeUserSessions: repository.revokeUserSessions.bind(repository),
  };
}

export type AdministrationUseCases = ReturnType<typeof createAdministrationUseCases>;
