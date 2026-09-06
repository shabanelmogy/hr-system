import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import FiscalYearService from "../services/fiscalYearService";
import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearMutationRequest,
  FiscalYearPageQuery,
  UpdateFiscalYearMutation,
} from "../types/FiscalYear";

export const fiscalYearKeys = {
  all: ["fiscalYears"] as const,
  list: () => [...fiscalYearKeys.all, "list"] as const,
  page: (query: FiscalYearPageQuery) => [...fiscalYearKeys.list(), query] as const,
  detail: (id: number) => [...fiscalYearKeys.all, "detail", id] as const,
  lookup: () => [...fiscalYearKeys.all, "lookup"] as const,
};

export const useFiscalYearPage = (query: FiscalYearPageQuery) =>
  useQuery({ queryKey: fiscalYearKeys.page(query), queryFn: () => FiscalYearService.getPage(query), placeholderData: previous => previous });

export const useFiscalYear = (id?: number | null, enabled = true) =>
  useQuery({ queryKey: fiscalYearKeys.detail(id ?? 0), queryFn: () => FiscalYearService.getById(id!), enabled: enabled && !!id });

export const fiscalYearLookupQueryOptions = () => ({
  queryKey: fiscalYearKeys.lookup(),
  queryFn: FiscalYearService.getLookup,
  staleTime: 60_000,
  // The app disables mount refetching globally. Fiscal Years are a live
  // cross-feature dependency, so cached lookup data must be reconciled whenever
  // a dependent workflow (such as Workforce Planning) is entered.
  refetchOnMount: "always" as const,
});

export const useFiscalYearLookup = () =>
  useQuery(fiscalYearLookupQueryOptions());

function useInvalidatingMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, mutationContext) => {
      await queryClient.invalidateQueries({ queryKey: fiscalYearKeys.all });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}

export const useCreateFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, FiscalYearMutationRequest>) =>
  useInvalidatingMutation(FiscalYearService.create, options);
export const useUpdateFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, UpdateFiscalYearMutation>) =>
  useInvalidatingMutation(FiscalYearService.update, options);
export const useArchiveFiscalYear = (options?: UseMutationOptions<number, Error, number>) =>
  useInvalidatingMutation(FiscalYearService.archive, options);
export const useRestoreFiscalYear = (options?: UseMutationOptions<FiscalYearDetail, Error, { id: number; rowVersion: string }>) =>
  useInvalidatingMutation(({ id, rowVersion }) => FiscalYearService.restore(id, rowVersion), options);
export const useChangeFiscalYearLifecycle = (options?: UseMutationOptions<FiscalYearDetail, Error, { id: number; rowVersion: string; action: FiscalYearLifecycleAction }>) =>
  useInvalidatingMutation(({ id, rowVersion, action }) => FiscalYearService.changeLifecycle(id, rowVersion, action), options);
