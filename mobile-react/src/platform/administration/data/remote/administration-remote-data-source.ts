import { apiService, toPageQuery } from '@/src/core/api';
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
} from '../../domain/models/administration';
import { administrationEndpoints as endpoints } from './administration-endpoints';
import {
  companyOptionSchema,
  managedUserPageSchema,
  managedUserSchema,
  roleOptionSchema,
  roleWithClaimsSchema,
  userInvitationSchema,
} from './administration-schemas';
import { z } from 'zod';

export interface AdministrationRemoteDataSource {
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

export const administrationRemoteDataSource: AdministrationRemoteDataSource = {
  async getUsersPage(query) {
    const queryString = toPageQuery(query);
    return managedUserPageSchema.parse(await apiService.get<unknown>(
      `${endpoints.usersPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },
  async getUsers() {
    return z.array(managedUserSchema).parse(await apiService.get<unknown>(endpoints.users));
  },
  async createUser(request) {
    return managedUserSchema.parse(
      await apiService.post<unknown, CreateManagedUserRequest>(endpoints.createUser, request),
    );
  },
  async getCompanyOptions() {
    return z.array(companyOptionSchema).parse(await apiService.get<unknown>(endpoints.companyOptions));
  },
  async getRoles() {
    return z.array(roleOptionSchema).parse(await apiService.get<unknown>(endpoints.roles));
  },
  async createRole(request) {
    return roleOptionSchema.parse(
      await apiService.post<unknown, CreateRoleRequest>(endpoints.createRole, request),
    );
  },
  async updateRole(request) {
    await apiService.put<void, UpdateRoleRequest>(endpoints.updateRole, request);
  },
  async toggleRole(id) {
    await apiService.put<void, undefined>(endpoints.toggleRole(id), undefined);
  },
  async getRoleClaims(id) {
    return roleWithClaimsSchema.parse(await apiService.get<unknown>(endpoints.roleClaims(id)));
  },
  async updateRoleClaims(request) {
    await apiService.put<void, UpdateRoleRequest>(endpoints.updateRoleClaims, request);
  },
  async getInvitations() {
    return z.array(userInvitationSchema).parse(await apiService.get<unknown>(endpoints.invitations));
  },
  async createInvitation(request) {
    return userInvitationSchema.parse(
      await apiService.post<unknown, CreateUserInvitationRequest>(endpoints.createInvitation, request),
    );
  },
  async resendInvitation(id) {
    return userInvitationSchema.parse(
      await apiService.post<unknown, undefined>(endpoints.resendInvitation(id), undefined),
    );
  },
  async revokeInvitation(id) {
    await apiService.delete<void>(endpoints.revokeInvitation(id));
  },
  async updateUser(id, request) {
    await apiService.put<void, UpdateManagedUserRequest>(endpoints.updateUser(id), request);
  },
  async changeUserPassword(id, request) {
    await apiService.put<void, ChangeManagedUserPasswordRequest>(endpoints.changePassword(id), request);
  },
  async toggleUser(id) {
    await apiService.put<void, undefined>(endpoints.toggleUser(id), undefined);
  },
  async unlockUser(id) {
    await apiService.put<void, undefined>(endpoints.unlockUser(id), undefined);
  },
  async archiveUser(id, reason) {
    await apiService.post<void, { reason: string }>(endpoints.archiveUser(id), { reason });
  },
  async restoreUser(id) {
    await apiService.post<void, undefined>(endpoints.restoreUser(id), undefined);
  },
  async revokeUserSessions(userId) {
    await apiService.put<void, undefined>(endpoints.revokeSessions(userId), undefined);
  },
};
