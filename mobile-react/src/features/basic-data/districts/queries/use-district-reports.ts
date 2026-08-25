import { useQuery } from '@tanstack/react-query';

import { crystalReportsApi } from '@/src/features/reporting';

import { districtKeys } from './district-keys';

export function useDistrictReportCatalog(enabled = true) {
  return useQuery({
    enabled,
    queryKey: districtKeys.reportCatalog(),
    queryFn: () => crystalReportsApi.listPublished('districts'),
    staleTime: 5 * 60_000,
  });
}
