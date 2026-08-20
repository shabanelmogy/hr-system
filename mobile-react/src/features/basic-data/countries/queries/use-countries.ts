import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { countryApi } from '../api/country-api';
import { countryKeys } from './country-keys';
import type { CountryPageQuery, CountryRequest } from '../types/country';

export function useCountries(query: CountryPageQuery) {
  return useQuery({ queryKey: countryKeys.list(query), queryFn: () => countryApi.getPage(query) });
}

export function useCountry(id: number | null) {
  return useQuery({
    enabled: id !== null,
    queryKey: countryKeys.detail(id ?? 0),
    queryFn: () => countryApi.getById(id ?? 0),
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: countryKeys.all }),
  });
}

export function useSaveCountry() {
  return useInvalidatingMutation(({ id, request }: { id: number | null; request: CountryRequest }) =>
    id === null ? countryApi.create(request) : countryApi.update(id, request));
}

export function useArchiveCountry() {
  return useInvalidatingMutation((id: number) => countryApi.archive(id));
}

export function useRestoreCountry() {
  return useInvalidatingMutation((id: number) => countryApi.restore(id));
}

export function useBulkArchiveCountries() {
  return useInvalidatingMutation((ids: number[]) => countryApi.bulkArchive(ids));
}
