import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { districtApi } from '../api/district-api';
import { districtKeys } from './district-keys';
import type { DistrictPageQuery, DistrictRequest } from '../types/district';

export function useDistricts(query: DistrictPageQuery) { return useQuery({ queryKey: districtKeys.list(query), queryFn: () => districtApi.getPage(query), placeholderData: (previous) => previous }); }
export function useDistrictLookup(stateId?: number) { return useQuery({ queryKey: districtKeys.lookup(stateId), queryFn: () => districtApi.getLookup(stateId), staleTime: 5 * 60_000 }); }
function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: async () => queryClient.invalidateQueries({ queryKey: districtKeys.all }) });
}
export function useSaveDistrict() { return useInvalidatingMutation(({ id, request }: { id: number | null; request: DistrictRequest }) => id === null ? districtApi.create(request) : districtApi.update(id, request)); }
export function useArchiveDistrict() { return useInvalidatingMutation((id: number) => districtApi.archive(id)); }
export function useRestoreDistrict() { return useInvalidatingMutation((id: number) => districtApi.restore(id)); }
export function useBulkArchiveDistricts() { return useInvalidatingMutation((ids: number[]) => districtApi.bulkArchive(ids)); }
export function useBulkCreateDistricts() { return useInvalidatingMutation((requests: DistrictRequest[]) => districtApi.bulkCreate(requests)); }
