import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { tenantApi, tenantKeys } from "./tenantApi";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";
import type { TenantManagementResponse } from "./types";

export function useTenantPage(
  query: ManagementPageQuery,
  options?: Omit<
    UseQueryOptions<ManagementPageResponse<TenantManagementResponse>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: tenantKeys.page(query),
    queryFn: () => tenantApi.getPage(query),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    ...options,
  });
}

export function useTenantsQuery() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: tenantApi.getAll,
  });
}
