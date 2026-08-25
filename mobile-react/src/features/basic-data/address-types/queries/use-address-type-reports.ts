import { useQuery } from '@tanstack/react-query';
import { crystalReportsApi } from '@/src/features/reporting';
import { addressTypeKeys } from './address-type-keys';
export function useAddressTypeReportCatalog(enabled = true) { return useQuery({ enabled, queryKey: addressTypeKeys.reports(), queryFn: () => crystalReportsApi.listPublished('addresstypes'), staleTime: 5 * 60_000 }); }
