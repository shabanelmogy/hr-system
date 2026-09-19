import { useQuery } from '@tanstack/react-query';

import { crystalReportsApi } from '@/src/platform/reporting';

import { countryKeys } from './country-keys';

export function useCountryReportCatalog(enabled = true) {
  return useQuery({
    enabled,
    queryKey: countryKeys.reportCatalog(),
    queryFn: () => crystalReportsApi.listPublished('countries'),
    staleTime: 5 * 60_000,
  });
}
