import { z } from 'zod';

import { apiService, pageMetadataSchema, toPageQuery } from '@/src/core/api';
import type { PageQuery, PageResponse } from '@/src/core/api';
import type {
  ChangeManagedUserPasswordRequest,
  CreateRoleRequest,
  CreateUserInvitationRequest,
  ManagedUser,
  RoleOption,
  RoleWithClaims,
  UpdateRoleRequest,
  UpdateManagedUserRequest,
  UserInvitation,
  UserCompanyOption,
} from '../types/administration';

const managedUserSchema = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  isDisabled: z.boolean(),
  isLocked: z.boolean(),
  profilePicture: z.string().nullable(),
  roles: z.array(z.string()),
  companyIds: z.array(z.number().int().positive()),
  defaultCompanyId: z.number().int().positive().nullable(),
  lifecycleStatus: z.enum(['active', 'archived']),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
});

const companyOptionSchema = z.object({
  id: z.number().int().positive(),
  nameAr: z.string(),
  nameEn: z.string(),
  isActive: z.boolean(),
});

const roleClaimSchema = z.object({
  displayValue: z.string().trim().min(1),
  isSelected: z.boolean(),
});

const roleOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  isSystem: z.boolean(),
  isDeleted: z.boolean(),
  roleClaims: z.array(roleClaimSchema).nullable(),
});

const roleWithClaimsSchema = roleOptionSchema.extend({
  roleClaims: z.array(roleClaimSchema),
});

const userInvitationSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  companyIds: z.array(z.number().int().positive()),
  defaultCompanyId: z.number().int().positive(),
  status: z.enum(['pending', 'accepted', 'revoked', 'expired']),
  expiresOn: z.string(),
  createdOn: z.string(),
  acceptedOn: z.string().nullable(),
  revokedOn: z.string().nullable(),
});

const endpoints = {
  users: 'users/getAll',
  usersPage: 'users/getPage',
  companyOptions: 'users/getCompanyOptions',
  invitations: 'userinvitations/getAll',
  createInvitation: 'userinvitations/create',
  resendInvitation: (id: string) => `userinvitations/resend/${encodeURIComponent(id)}`,
  revokeInvitation: (id: string) => `userinvitations/revoke/${encodeURIComponent(id)}`,
  updateUser: (id: string) => `users/update/${id}`,
  changePassword: (id: string) => `users/changePassword/${id}`,
  toggleUser: (id: string) => `users/toggle/${id}`,
  unlockUser: (id: string) => `users/unlock/${id}`,
  archiveUser: (id: string) => `users/archive/${id}`,
  restoreUser: (id: string) => `users/restore/${id}`,
  revokeSessions: (userId: string) =>
    `auth/revokeRefreshTokenByUserId?userId=${encodeURIComponent(userId)}`,
  roles: 'roles/getAll',
  createRole: 'roles/add',
  updateRole: 'roles/update',
  toggleRole: (id: string) => `roles/toggle/${encodeURIComponent(id)}`,
  roleClaims: (id: string) => `roles/getRoleClaims?roleId=${encodeURIComponent(id)}`,
  updateRoleClaims: 'roles/updateRoleClaims',
} as const;

export const administrationApi = {
  async getUsersPage(query: PageQuery): Promise<PageResponse<ManagedUser>> {
    const queryString = toPageQuery(query);
    return z.object({
      items: z.array(managedUserSchema),
      metaData: pageMetadataSchema,
    }).parse(await apiService.get<unknown>(
      `${endpoints.usersPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },

  async getUsers(): Promise<ManagedUser[]> {
    return z.array(managedUserSchema).parse(
      await apiService.get<unknown>(endpoints.users),
    );
  },

  async getCompanyOptions(): Promise<UserCompanyOption[]> {
    return z.array(companyOptionSchema).parse(
      await apiService.get<unknown>(endpoints.companyOptions),
    );
  },

  async getRoles(): Promise<RoleOption[]> {
    return z.array(roleOptionSchema).parse(
      await apiService.get<unknown>(endpoints.roles),
    );
  },

  async createRole(request: CreateRoleRequest): Promise<RoleOption> {
    return roleOptionSchema.parse(
      await apiService.post<unknown, CreateRoleRequest>(endpoints.createRole, request),
    );
  },

  async updateRole(request: UpdateRoleRequest): Promise<void> {
    await apiService.put<void, UpdateRoleRequest>(endpoints.updateRole, request);
  },

  async toggleRole(id: string): Promise<void> {
    await apiService.put<void, undefined>(endpoints.toggleRole(id), undefined);
  },

  async getRoleClaims(id: string): Promise<RoleWithClaims> {
    return roleWithClaimsSchema.parse(
      await apiService.get<unknown>(endpoints.roleClaims(id)),
    );
  },

  async updateRoleClaims(request: UpdateRoleRequest): Promise<void> {
    await apiService.put<void, UpdateRoleRequest>(endpoints.updateRoleClaims, request);
  },

  async getInvitations(): Promise<UserInvitation[]> {
    return z.array(userInvitationSchema).parse(await apiService.get<unknown>(endpoints.invitations));
  },

  async createInvitation(request: CreateUserInvitationRequest): Promise<UserInvitation> {
    return userInvitationSchema.parse(
      await apiService.post<unknown, CreateUserInvitationRequest>(endpoints.createInvitation, request),
    );
  },

  async resendInvitation(id: string): Promise<UserInvitation> {
    return userInvitationSchema.parse(
      await apiService.post<unknown, undefined>(endpoints.resendInvitation(id), undefined),
    );
  },

  async revokeInvitation(id: string): Promise<void> {
    await apiService.delete<void>(endpoints.revokeInvitation(id));
  },

  async updateUser(id: string, request: UpdateManagedUserRequest): Promise<void> {
    await apiService.put<void, UpdateManagedUserRequest>(endpoints.updateUser(id), request);
  },

  async changeUserPassword(
    id: string,
    request: ChangeManagedUserPasswordRequest,
  ): Promise<void> {
    await apiService.put<void, ChangeManagedUserPasswordRequest>(
      endpoints.changePassword(id),
      request,
    );
  },

  async toggleUser(id: string): Promise<void> {
    await apiService.put<void, undefined>(endpoints.toggleUser(id), undefined);
  },

  async unlockUser(id: string): Promise<void> {
    await apiService.put<void, undefined>(endpoints.unlockUser(id), undefined);
  },

  async archiveUser(id: string, reason: string): Promise<void> {
    await apiService.post<void, { reason: string }>(endpoints.archiveUser(id), { reason });
  },

  async restoreUser(id: string): Promise<void> {
    await apiService.post<void, undefined>(endpoints.restoreUser(id), undefined);
  },

  async revokeUserSessions(userId: string): Promise<void> {
    await apiService.put<void, undefined>(endpoints.revokeSessions(userId), undefined);
  },
};
