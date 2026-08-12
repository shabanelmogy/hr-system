import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { tenantApi } from '@/src/features/tenants/api/tenant-api';
import type { TenantManagementRequest } from '@/src/features/tenants/types/tenant';

export const tenantKeys = {
  all: ['tenants'] as const,
};

export function useTenants() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: tenantApi.getAll,
    refetchInterval: 10_000,
  });
}

export function useSaveTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string | null;
      request: TenantManagementRequest;
    }) => (id ? tenantApi.update(id, request) : tenantApi.create(request)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
