import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StateUseCases } from '../../application/state-use-cases';
import { stateUseCases } from '../../composition/state-container';
import type { StatePageQuery, StateRequest } from '../../domain/models/state';
import { stateKeys } from './state-keys';

export function useStates(query: StatePageQuery) {
  return useQuery({
    queryKey: stateKeys.list(query),
    queryFn: () => stateUseCases.getPage(query),
    placeholderData: (previous) => previous,
  });
}

export function useStateLookup(countryId?: number, options: { enabled?: boolean } = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryKey: stateKeys.lookup(countryId),
    queryFn: () => stateUseCases.getLookup(countryId),
    staleTime: 5 * 60_000,
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables, useCases: StateUseCases) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(variables, stateUseCases),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: stateKeys.all }),
  });
}
export function useSaveState() { return useInvalidatingMutation(({ id, request }: { id: number | null; request: StateRequest }, useCases) => useCases.save({ id, request })); }
export function useArchiveState() { return useInvalidatingMutation((id: number, useCases) => useCases.archive(id)); }
export function useRestoreState() { return useInvalidatingMutation((id: number, useCases) => useCases.restore(id)); }
export function useBulkArchiveStates() { return useInvalidatingMutation((ids: number[], useCases) => useCases.bulkArchive(ids)); }
export function useBulkCreateStates() { return useInvalidatingMutation((requests: StateRequest[], useCases) => useCases.bulkCreate(requests)); }
