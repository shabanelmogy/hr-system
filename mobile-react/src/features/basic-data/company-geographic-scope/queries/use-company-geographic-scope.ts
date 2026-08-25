import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { companyGeographicScopeApi } from '../api/company-geographic-scope-api';
import { companyGeographicScopeKeys } from './company-geographic-scope-keys';

export function useCompanyGeographicScope(enabled: boolean) {
  return useQuery({
    queryKey: companyGeographicScopeKeys.current(),
    queryFn: companyGeographicScopeApi.get,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateCompanyGeographicScope() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companyGeographicScopeApi.update,
    onSuccess: async (scope) => {
      queryClient.setQueryData(companyGeographicScopeKeys.current(), scope);
      await queryClient.invalidateQueries({ queryKey: companyGeographicScopeKeys.all });
    },
  });
}
