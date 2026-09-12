import type {
  AdministrationPageQuery,
  ChangeManagedUserPasswordRequest,
  CreateManagedUserRequest,
  CreateRoleRequest,
  CreateUserInvitationRequest,
  ManagedUser,
  ManagedUserPage,
  RoleOption,
  RoleWithClaims,
  UpdateManagedUserRequest,
  UpdateRoleRequest,
  UserCompanyOption,
  UserInvitation,
} from '../models/administration';

export interface AdministrationRepository {
  getUsersPage(query: AdministrationPageQuery): Promise<ManagedUserPage>;
  getUsers(): Promise<ManagedUser[]>;
  createUser(request: CreateManagedUserRequest): Promise<ManagedUser>;
  getCompanyOptions(): Promise<UserCompanyOption[]>;
  getRoles(): Promise<RoleOption[]>;
  createRole(request: CreateRoleRequest): Promise<RoleOption>;
  updateRole(request: UpdateRoleRequest): Promise<void>;
  toggleRole(id: string): Promise<void>;
  getRoleClaims(id: string): Promise<RoleWithClaims>;
  updateRoleClaims(request: UpdateRoleRequest): Promise<void>;
  getInvitations(): Promise<UserInvitation[]>;
  createInvitation(request: CreateUserInvitationRequest): Promise<UserInvitation>;
  resendInvitation(id: string): Promise<UserInvitation>;
  revokeInvitation(id: string): Promise<void>;
  updateUser(id: string, request: UpdateManagedUserRequest): Promise<void>;
  changeUserPassword(id: string, request: ChangeManagedUserPasswordRequest): Promise<void>;
  toggleUser(id: string): Promise<void>;
  unlockUser(id: string): Promise<void>;
  archiveUser(id: string, reason: string): Promise<void>;
  restoreUser(id: string): Promise<void>;
  revokeUserSessions(userId: string): Promise<void>;
}
