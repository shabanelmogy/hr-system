import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stateApi } from '../api/state-api';
import { stateKeys } from './state-keys';
import type { StatePageQuery, StateRequest } from '../types/state';

export function useStates(query: StatePageQuery) { return useQuery({ queryKey: stateKeys.list(query), queryFn: () => stateApi.getPage(query), placeholderData: (previous) => previous }); }
export function useStateLookup(countryId?: number) { return useQuery({ queryKey: stateKeys.lookup(countryId), queryFn: () => stateApi.getLookup(countryId), staleTime: 5 * 60_000 }); }
function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: async () => queryClient.invalidateQueries({ queryKey: stateKeys.all }) });
}
export function useSaveState() { return useInvalidatingMutation(({ id, request }: { id: number | null; request: StateRequest }) => id === null ? stateApi.create(request) : stateApi.update(id, request)); }
export function useArchiveState() { return useInvalidatingMutation((id: number) => stateApi.archive(id)); }
export function useRestoreState() { return useInvalidatingMutation((id: number) => stateApi.restore(id)); }
export function useBulkArchiveStates() { return useInvalidatingMutation((ids: number[]) => stateApi.bulkArchive(ids)); }
export function useBulkCreateStates() { return useInvalidatingMutation((requests: StateRequest[]) => stateApi.bulkCreate(requests)); }
