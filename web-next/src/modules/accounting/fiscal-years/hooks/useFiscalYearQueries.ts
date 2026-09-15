import { useQuery, type UseMutationOptions } from "@tanstack/react-query";
import { createEntityQueryKeys, useInvalidatingMutation } from "@/shared/query";
import FiscalYearService from "../services/fiscalYearService";
import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearMutationRequest,
  FiscalYearPageQuery,
  UpdateFiscalYearMutation,
} from "../types/FiscalYear";

export const fiscalYearKeys = createEntityQueryKeys("fiscalYears");

export const useFiscalYearPage = (query: FiscalYearPageQuery) =>
  useQuery({ queryKey: fiscalYearKeys.page(query), queryFn: () => FiscalYearService.getPage(query), placeholderData: previous => previous });

export const useFiscalYear = (id?: number | null, enabled = true) =>
  useQuery({ queryKey: fiscalYearKeys.detail(id ?? 0), queryFn: () => FiscalYearService.getById(id!), enabled: enabled && !!id });

export const fiscalYearLookupQueryOptions = () => ({
  queryKey: fiscalYearKeys.lookup(),
  queryFn: FiscalYearService.getLookup,
  staleTime: 60_000,
  // Fiscal Years are a live cross-feature dependency, so reconcile the lookup
  // on every dependent workflow entry even when the global cache is still fresh.
  refetchOnMount: "always" as const,
});

export const useFiscalYearLookup = () =>
  useQuery(fiscalYearLookupQueryOptions());

export const useCreateFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, FiscalYearMutationRequest>) =>
  useInvalidatingMutation(FiscalYearService.create, [fiscalYearKeys.all], options);
export const useUpdateFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, UpdateFiscalYearMutation>) =>
  useInvalidatingMutation(FiscalYearService.update, [fiscalYearKeys.all], options);
export const useArchiveFiscalYear = (options?: UseMutationOptions<number, Error, number>) =>
  useInvalidatingMutation(FiscalYearService.archive, [fiscalYearKeys.all], options);
export const useRestoreFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, { id: number; rowVersion: string }>) =>
  useInvalidatingMutation(({ id, rowVersion }) => FiscalYearService.restore(id, rowVersion), [fiscalYearKeys.all], options);
export const useChangeFiscalYearLifecycle = (options?: UseMutationOptions<FiscalYearDetail, Error, { id: number; rowVersion: string; action: FiscalYearLifecycleAction }>) =>
  useInvalidatingMutation(({ id, rowVersion, action }) => FiscalYearService.changeLifecycle(id, rowVersion, action), [fiscalYearKeys.all], options);
