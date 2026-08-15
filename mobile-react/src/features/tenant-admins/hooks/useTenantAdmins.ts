import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tenantAdminApi } from '@/src/features/tenant-admins/api/tenant-admin-api';
import type { TenantAdminRequest } from '@/src/features/tenant-admins/types/tenant-admin';
import type { PageQuery } from '@/src/core/api';

export const tenantAdminKeys = {
  all: ['tenant-admins'] as const,
};

export function useTenantAdmins() {
  return useQuery({
    queryKey: tenantAdminKeys.all,
    queryFn: tenantAdminApi.getAll,
  });
}

export function useTenantAdminPage(query: PageQuery) {
  return useQuery({
    queryKey: [...tenantAdminKeys.all, 'page', query] as const,
    queryFn: () => tenantAdminApi.getPage(query),
  });
}

export function useSaveTenantAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string | null; request: TenantAdminRequest }) =>
      id ? tenantAdminApi.update(id, request) : tenantAdminApi.create(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
    },
  });
}

export function useDeleteTenantAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tenantAdminApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantAdminKeys.all });
    },
  });
}
