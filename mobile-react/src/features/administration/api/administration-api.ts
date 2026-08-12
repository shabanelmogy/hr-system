import { z } from 'zod';

import { apiService } from '@/src/core/api';
import type {
  ChangeManagedUserPasswordRequest,
  CreateRoleRequest,
  CreateManagedUserRequest,
  ManagedUser,
  RoleOption,
  RoleWithClaims,
  UpdateRoleRequest,
  UpdateManagedUserRequest,
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
  isDeleted: z.boolean(),
  roleClaims: z.array(roleClaimSchema).nullable(),
});

const roleWithClaimsSchema = roleOptionSchema.extend({
  roleClaims: z.array(roleClaimSchema),
});

const endpoints = {
  users: 'users/getAll',
  companyOptions: 'users/getCompanyOptions',
  createUser: 'users/add',
  updateUser: (id: string) => `users/update/${id}`,
  changePassword: (id: string) => `users/changePassword/${id}`,
  toggleUser: (id: string) => `users/toggle/${id}`,
  unlockUser: (id: string) => `users/unlock/${id}`,
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

  async createUser(request: CreateManagedUserRequest): Promise<ManagedUser> {
    return managedUserSchema.parse(
      await apiService.post<unknown, CreateManagedUserRequest>(endpoints.createUser, request),
    );
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

  async revokeUserSessions(userId: string): Promise<void> {
    await apiService.put<void, undefined>(endpoints.revokeSessions(userId), undefined);
  },
};
