import { useQuery, type UseMutationOptions } from "@tanstack/react-query";
import { useInvalidatingMutation } from "@/shared/query";
import { currencyService } from "../services/currencyService";
import type { Currency, CurrencyLookup, CurrencyMutationRequest, CurrencyPageQuery } from "../types/Currency";
import { currencyKeys } from "./currencyQueryKeys";

export { currencyKeys } from "./currencyQueryKeys";

export const useCurrency = (id?: number | null, enabled = true) =>
  useQuery({
    queryKey: currencyKeys.detail(id ?? 0),
    queryFn: () => currencyService.getById(id!),
    enabled: enabled && !!id,
  });

export const currencyLookupQueryOptions = () => ({
  queryKey: currencyKeys.lookup(),
  queryFn: currencyService.getLookup,
  staleTime: 60_000,
  refetchOnMount: "always" as const,
});

export const useCurrencyLookup = (enabled = true) =>
  useQuery({ ...currencyLookupQueryOptions(), enabled });

export const useCreateCurrency = (options?: UseMutationOptions<Currency, Error, CurrencyMutationRequest>) =>
  useInvalidatingMutation(currencyService.create, [currencyKeys.all], options);

export const useUpdateCurrency = (options?: UseMutationOptions<Currency, Error, { id: number; request: CurrencyMutationRequest; rowVersion: string }>) =>
  useInvalidatingMutation(currencyService.update, [currencyKeys.all], options);

export const useArchiveCurrency = (options?: UseMutationOptions<number, Error, { id: number; rowVersion: string }>) =>
  useInvalidatingMutation(currencyService.archive, [currencyKeys.all], options);

export const useRestoreCurrency = (options?: UseMutationOptions<Currency, Error, { id: number; rowVersion: string }>) =>
  useInvalidatingMutation(currencyService.restore, [currencyKeys.all], options);

export type { CurrencyLookup, CurrencyPageQuery };
