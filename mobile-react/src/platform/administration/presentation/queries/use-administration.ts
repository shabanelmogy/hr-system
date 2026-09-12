import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  AdministrationPageQuery,
  CreateManagedUserRequest,
} from '../../domain/models/administration';
import type {
  SaveManagedUserInput,
  SaveRoleInput,
} from '../../application/administration-use-cases';
import { useAdministrationUseCases } from '../../composition/use-administration-use-cases';
import type { RolePermissionsFormValues } from '../models/administration-form';

export const administrationKeys = {
  users: ['administration', 'users'] as const,
  invitations: ['administration', 'user-invitations'] as const,
  companyOptions: ['administration', 'company-options'] as const,
  roles: ['administration', 'roles'] as const,
  roleClaims: (roleId: string) => ['administration', 'roles', roleId, 'claims'] as const,
};

export function useManagedUsers() {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: administrationKeys.users,
    queryFn: () => useCases.getUsers(),
  });
}

export function useManagedUsersPage(query: AdministrationPageQuery) {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: [...administrationKeys.users, 'page', query] as const,
    queryFn: () => useCases.getUsersPage(query),
  });
}

export function useCreateManagedUser() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (request: CreateManagedUserRequest) => useCases.createUser(request),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useUserInvitations(enabled = true) {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: administrationKeys.invitations,
    queryFn: () => useCases.getInvitations(),
    enabled,
  });
}

export function useAssignableCompanies() {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: administrationKeys.companyOptions,
    queryFn: () => useCases.getCompanyOptions(),
    staleTime: 60_000,
  });
}

export function useRoleOptions(enabled = true) {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: administrationKeys.roles,
    queryFn: () => useCases.getRoles(),
    enabled,
    staleTime: 60_000,
  });
}

export function useSaveRole() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (input: SaveRoleInput) => useCases.saveRole(input),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.roles });
    },
  });
}

export function useToggleRole() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (id: string) => useCases.toggleRole(id),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.roles });
    },
  });
}

export function useRoleClaims(roleId: string) {
  const useCases = useAdministrationUseCases();
  return useQuery({
    queryKey: administrationKeys.roleClaims(roleId),
    queryFn: () => useCases.getRoleClaims(roleId),
    enabled: roleId.length > 0,
  });
}

export function useUpdateRoleClaims() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (values: RolePermissionsFormValues) =>
      useCases.updateRoleClaims(values),
    networkMode: 'always',
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
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (input: SaveManagedUserInput) => useCases.saveManagedUser(input),
    networkMode: 'always',
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
  const useCases = useAdministrationUseCases();
  return useMutation({
    mutationFn: (id: string) => useCases.resendInvitation(id),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.invitations });
    },
  });
}

export function useRevokeUserInvitation() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();
  return useMutation({
    mutationFn: (id: string) => useCases.revokeInvitation(id),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.invitations });
    },
  });
}

export function useToggleManagedUser() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (id: string) => useCases.toggleUser(id),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useUnlockManagedUser() {
  const queryClient = useQueryClient();
  const useCases = useAdministrationUseCases();

  return useMutation({
    mutationFn: (id: string) => useCases.unlockUser(id),
    networkMode: 'always',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: administrationKeys.users });
    },
  });
}

export function useRevokeManagedUserSessions() {
  const useCases = useAdministrationUseCases();
  return useMutation({
    mutationFn: (userId: string) => useCases.revokeUserSessions(userId),
    networkMode: 'always',
  });
}
