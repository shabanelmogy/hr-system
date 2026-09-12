import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DistrictUseCases } from '../../application/district-use-cases';
import { useDistrictUseCases } from '../../composition/use-district-use-cases';
import type { DistrictPageQuery, DistrictRequest } from '../../domain/models/district';
import { districtKeys } from './district-keys';

export function useDistricts(query: DistrictPageQuery) {
  const useCases = useDistrictUseCases();
  return useQuery({
    queryKey: districtKeys.list(query),
    queryFn: () => useCases.getPage(query),
    placeholderData: (previous) => previous,
    networkMode: 'always',
  });
}

export function useDistrictLookup(stateId?: number, options: { enabled?: boolean } = {}) {
  const useCases = useDistrictUseCases();
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: districtKeys.lookup(stateId),
    queryFn: () => useCases.getLookup(stateId),
    staleTime: 5 * 60_000,
    networkMode: 'always',
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables, useCases: DistrictUseCases) => Promise<TResult>,
) {
  const useCases = useDistrictUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(variables, useCases),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: districtKeys.all }),
    networkMode: 'always',
  });
}

export function useSaveDistrict() {
  return useInvalidatingMutation(({ id, request }: { id: number | null; request: DistrictRequest }, useCases) =>
    useCases.save({ id, request }));
}
export function useArchiveDistrict() { return useInvalidatingMutation((id: number, useCases) => useCases.archive(id)); }
export function useRestoreDistrict() { return useInvalidatingMutation((id: number, useCases) => useCases.restore(id)); }
export function useBulkArchiveDistricts() { return useInvalidatingMutation((ids: number[], useCases) => useCases.bulkArchive(ids)); }
export function useBulkCreateDistricts() { return useInvalidatingMutation((requests: DistrictRequest[], useCases) => useCases.bulkCreate(requests)); }
