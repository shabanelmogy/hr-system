import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  TenantAdminPageQuery,
  TenantAdminRequest,
} from '../../domain/models/tenant-admin';
import { useTenantAdminUseCases } from '../../composition/use-tenant-admin-use-cases';

export const tenantAdminKeys = {
  all: ['tenant-admins'] as const,
  page: (query: TenantAdminPageQuery) => ['tenant-admins', 'page', query] as const,
};

export function useTenantAdmins() {
  const useCases = useTenantAdminUseCases();
  return useQuery({
    queryKey: tenantAdminKeys.all,
    queryFn: () => useCases.getAll(),
  });
}

export function useTenantAdminPage(query: TenantAdminPageQuery) {
  const useCases = useTenantAdminUseCases();
  return useQuery({
    queryKey: tenantAdminKeys.page(query),
    queryFn: () => useCases.getPage(query),
  });
}

export function useSaveTenantAdmin() {
  const queryClient = useQueryClient();
  const useCases = useTenantAdminUseCases();
  return useMutation({
    mutationFn: ({ id, request }: { id: string | null; request: TenantAdminRequest }) =>
      useCases.save({ id, request }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
    },
  });
}

export function useDeleteTenantAdmin() {
  const queryClient = useQueryClient();
  const useCases = useTenantAdminUseCases();
  return useMutation({
    mutationFn: (id: string) => useCases.archive(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
    },
  });
}

export function useRestoreTenantAdmin() {
  const queryClient = useQueryClient();
  const useCases = useTenantAdminUseCases();
  return useMutation({
    mutationFn: (id: string) => useCases.restore(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
    },
  });
}
