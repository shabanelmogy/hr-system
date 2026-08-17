import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { administrationApi } from '../api/administration-api';
import type {
  ChangeManagedUserPasswordRequest,
  CreateManagedUserRequest,
  CreateRoleRequest,
  CreateUserInvitationRequest,
  RolePermissionsFormValues,
  UpdateRoleRequest,
  UpdateManagedUserRequest,
} from '../types/administration';
import type { PageQuery } from '@/src/core/api';

export const administrationKeys = {
  users: ['administration', 'users'] as const,
  invitations: ['administration', 'user-invitations'] as const,
  companyOptions: ['administration', 'company-options'] as const,
  roles: ['administration', 'roles'] as const,
  roleClaims: (roleId: string) => ['administration', 'roles', roleId, 'claims'] as const,
};

type SaveManagedUserInput =
  | { id: null; request: CreateUserInvitationRequest }
  | {
      id: string;
      request: UpdateManagedUserRequest;
      password?: ChangeManagedUserPasswordRequest;
    };

export function useManagedUsers() {
  return useQuery({
    queryKey: administrationKeys.users,
    queryFn: administrationApi.getUsers,
  });
}

export function useManagedUsersPage(query: PageQuery) {
  return useQuery({
    queryKey: [...administrationKeys.users, 'page', query] as const,
    queryFn: () => administrationApi.getUsersPage(query),
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateManagedUserRequest) => administrationApi.createUser(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useUserInvitations(enabled = true) {
  return useQuery({
    queryKey: administrationKeys.invitations,
    queryFn: administrationApi.getInvitations,
    enabled,
  });
}

export function useAssignableCompanies() {
  return useQuery({
    queryKey: administrationKeys.companyOptions,
    queryFn: administrationApi.getCompanyOptions,
    staleTime: 60_000,
  });
}

export function useRoleOptions(enabled = true) {
  return useQuery({
    queryKey: administrationKeys.roles,
    queryFn: administrationApi.getRoles,
    enabled,
    staleTime: 60_000,
  });
}

type SaveRoleInput =
  | { id: null; request: CreateRoleRequest }
  | { id: string; request: UpdateRoleRequest };

export function useSaveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveRoleInput) => {
      if (input.id === null) {
        await administrationApi.createRole(input.request);
        return;
      }

      await administrationApi.updateRole(input.request);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.roles });
    },
  });
}

export function useToggleRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: administrationApi.toggleRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.roles });
    },
  });
}

export function useRoleClaims(roleId: string) {
  return useQuery({
    queryKey: administrationKeys.roleClaims(roleId),
    queryFn: () => administrationApi.getRoleClaims(roleId),
    enabled: roleId.length > 0,
  });
}

export function useUpdateRoleClaims() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RolePermissionsFormValues) =>
      administrationApi.updateRoleClaims(values),
    onSuccess: async (_, values) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: administrationKeys.roles }),
        queryClient.invalidateQueries({ queryKey: administrationKeys.roleClaims(values.id) }),
      ]);
    },
  });
}

export function useSaveManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveManagedUserInput) => {
      if (input.id === null) return administrationApi.createInvitation(input.request);

      await administrationApi.updateUser(input.id, input.request);
      if (input.password) {
        await administrationApi.changeUserPassword(input.id, input.password);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: administrationKeys.users }),
        queryClient.invalidateQueries({ queryKey: administrationKeys.invitations }),
      ]);
    },
  });
}

export function useResendUserInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: administrationApi.resendInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.invitations });
    },
  });
}

export function useRevokeUserInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: administrationApi.revokeInvitation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.invitations });
    },
  });
}

export function useToggleManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: administrationApi.toggleUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useUnlockManagedUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: administrationApi.unlockUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useRevokeManagedUserSessions() {
  return useMutation({
    mutationFn: administrationApi.revokeUserSessions,
  });
}
