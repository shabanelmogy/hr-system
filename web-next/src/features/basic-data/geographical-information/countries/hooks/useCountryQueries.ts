import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import CountryService from "../services/countryService";
import type {
  CountryDetail,
  BulkArchiveCountriesResponse,
  CountryLookup,
  CountryPageQuery,
  CountryPageResponse,
  CreateCountryRequest,
  UpdateCountryMutation,
} from "../types/Country";

export const countryKeys = {
  all: ["countries"] as const,
  pages: () => [...countryKeys.all, "page"] as const,
  page: (query: CountryPageQuery) => [...countryKeys.pages(), query] as const,
  lookup: () => [...countryKeys.all, "lookup"] as const,
  details: () => [...countryKeys.all, "detail"] as const,
  detail: (id: number) => [...countryKeys.details(), id] as const,
};

export const useCountryPage = (
  query: CountryPageQuery,
  options?: Omit<UseQueryOptions<CountryPageResponse, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: countryKeys.page(query),
    queryFn: () => CountryService.getPage(query),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    ...options,
  });

export const useCountryLookup = (
  options?: Omit<UseQueryOptions<CountryLookup[], Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: countryKeys.lookup(),
    queryFn: CountryService.getLookup,
    staleTime: 5 * 60_000,
    ...options,
  });

export const useCountry = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<CountryDetail, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: countryKeys.detail(id!),
    queryFn: () => CountryService.getById(id!),
    enabled: id != null,
    staleTime: 5 * 60_000,
    ...options,
  });

function useCountryMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, meta) => {
      await queryClient.invalidateQueries({ queryKey: countryKeys.all });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });
}

export const useCreateCountry = (options?: UseMutationOptions<CountryDetail, Error, CreateCountryRequest>) =>
  useCountryMutation(CountryService.create, options);

export const useUpdateCountry = (options?: UseMutationOptions<CountryDetail, Error, UpdateCountryMutation>) =>
  useCountryMutation(CountryService.update, options);

export const useArchiveCountry = (options?: UseMutationOptions<number, Error, number>) =>
  useCountryMutation(CountryService.archive, options);

export const useRestoreCountry = (options?: UseMutationOptions<number, Error, number>) =>
  useCountryMutation(CountryService.restore, options);

export const useBulkArchiveCountries = (
  options?: UseMutationOptions<BulkArchiveCountriesResponse, Error, number[]>,
) => useCountryMutation(CountryService.archiveBulk, options);

export const useInvalidateCountries = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: countryKeys.all });
};
