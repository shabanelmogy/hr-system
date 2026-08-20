import { useQuery } from '@tanstack/react-query';

import { countryReportApi } from '../api/country-report-api';
import { countryKeys } from './country-keys';

export function useCountryReportCatalog(language: 'ar' | 'en', enabled = true) {
  return useQuery({
    enabled,
    queryKey: countryKeys.reportCatalog(language),
    queryFn: () => countryReportApi.getCatalog(language),
    staleTime: 5 * 60_000,
  });
}
