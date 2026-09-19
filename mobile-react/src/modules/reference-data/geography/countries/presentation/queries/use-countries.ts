import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { OFFLINE_CAPABILITY_IDS } from '@/src/core/offline-policy';
import { useOfflineReadPreferences } from '@/src/core/preferences';
import { useOfflineOperationsPolicy } from '@/src/platform/offline-operations';
import type { CountryUseCases } from '../../application/country-use-cases';
import { useCountryUseCases } from '../../composition/use-country-use-cases';
import type { CountryPageQuery, CountryRequest } from '../../domain/models/country';
import { countryKeys } from './country-keys';

export function useCountries(query: CountryPageQuery) {
  const countryUseCases = useCountryUseCases();
  const offlinePreferences = useOfflineReadPreferences();
  const offlinePolicy = useOfflineOperationsPolicy();
  const offlineReadEnabled = offlinePolicy.loaded
    && offlinePolicy.canReadOffline(OFFLINE_CAPABILITY_IDS.countriesRead)
    && offlinePreferences.isOfflineReadEnabled('countries');
  const mode = offlineReadEnabled ? 'offline-read' : 'online-required';
  return useQuery({
    enabled: offlinePreferences.loaded && offlinePolicy.loaded,
    queryKey: countryKeys.list(query, mode),
    queryFn: () => countryUseCases.getPage(query),
    placeholderData: (previous) => previous,
    networkMode: 'always',
  });
}

export function useCountryLookup(options: { enabled?: boolean } = {}) {
  const countryUseCases = useCountryUseCases();
  const offlinePreferences = useOfflineReadPreferences();
  const offlinePolicy = useOfflineOperationsPolicy();
  const offlineReadEnabled = offlinePolicy.loaded
    && offlinePolicy.canReadOffline(OFFLINE_CAPABILITY_IDS.countriesRead)
    && offlinePreferences.isOfflineReadEnabled('countries');
  const mode = offlineReadEnabled ? 'offline-read' : 'online-required';
  return useQuery({
    enabled: offlinePreferences.loaded && offlinePolicy.loaded && (options.enabled ?? true),
    queryKey: countryKeys.lookup(mode),
    queryFn: () => countryUseCases.getLookup(),
    select: (result) => result.value,
    staleTime: 5 * 60_000,
    networkMode: 'always',
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables, useCases: CountryUseCases) => Promise<TResult>,
) {
  const countryUseCases = useCountryUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(variables, countryUseCases),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: countryKeys.all }),
    networkMode: 'always',
  });
}

export function useSaveCountry() {
  return useInvalidatingMutation(({ id, request }: { id: number | null; request: CountryRequest }, useCases) =>
    useCases.save({ id, request }));
}

export function useArchiveCountry() {
  return useInvalidatingMutation((id: number, useCases) => useCases.archive(id));
}

export function useRestoreCountry() {
  return useInvalidatingMutation((id: number, useCases) => useCases.restore(id));
}

export function useBulkArchiveCountries() {
  return useInvalidatingMutation((ids: number[], useCases) => useCases.bulkArchive(ids));
}

export function useBulkCreateCountries() {
  return useInvalidatingMutation((requests: CountryRequest[], useCases) => useCases.bulkCreate(requests));
}
