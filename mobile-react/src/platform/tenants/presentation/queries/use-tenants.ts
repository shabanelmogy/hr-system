import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  TenantManagementRequest,
  TenantPageQuery,
} from '../../domain/models/tenant';
import type { TenantArchiveRequest } from '../../domain/repositories/tenant-repository';
import { useTenantUseCases } from '../../composition/use-tenant-use-cases';

export const tenantKeys = {
  all: ['tenants'] as const,
  page: (query: TenantPageQuery) => ['tenants', 'page', query] as const,
};

export function useTenants() {
  const useCases = useTenantUseCases();
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: () => useCases.getAll(),
  });
}

export function useTenantPage(query: TenantPageQuery) {
  const useCases = useTenantUseCases();
  return useQuery({
    queryKey: tenantKeys.page(query),
    queryFn: () => useCases.getPage(query),
  });
}

export function useSaveTenant() {
  const queryClient = useQueryClient();
  const useCases = useTenantUseCases();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string | null;
      request: TenantManagementRequest;
    }) => useCases.save({ id, request }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useArchiveTenant() {
  const queryClient = useQueryClient();
  const useCases = useTenantUseCases();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: TenantArchiveRequest }) =>
      useCases.archive(id, request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function useRestoreTenant() {
  const queryClient = useQueryClient();
  const useCases = useTenantUseCases();
  return useMutation({
    mutationFn: ({ id, rowVersion }: { id: string; rowVersion: string }) =>
      useCases.restore(id, rowVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}
