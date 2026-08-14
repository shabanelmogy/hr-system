import { useQuery } from "@tanstack/react-query";

import { tenantApi, tenantKeys } from "./tenantApi";

export function useTenantsQuery() {
  return useQuery({
    queryKey: tenantKeys.all,
    queryFn: tenantApi.getAll,
  });
}
