import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCompanyGeographicScopeUseCases } from '../../composition/use-company-geographic-scope-use-cases';
import { companyGeographicScopeKeys } from './company-geographic-scope-keys';

export function useCompanyGeographicScope(enabled: boolean) {
  const useCases = useCompanyGeographicScopeUseCases();
  return useQuery({
    queryKey: companyGeographicScopeKeys.current(),
    queryFn: () => useCases.get(),
    enabled,
    staleTime: 5 * 60_000,
    networkMode: 'always',
  });
}

export function useUpdateCompanyGeographicScope() {
  const useCases = useCompanyGeographicScopeUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: Parameters<typeof useCases.update>[0]) => useCases.update(request),
    onSuccess: async (scope) => {
      queryClient.setQueryData(companyGeographicScopeKeys.current(), scope);
      await queryClient.invalidateQueries({ queryKey: companyGeographicScopeKeys.all });
    },
    networkMode: 'always',
  });
}
