import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import CountryService from "../services/countryService";
import { Country, CreateCountryRequest, UpdateCountryRequest } from "../types/Country";

// Query Keys
export const countryKeys = {
  all: ["countries"] as const,
  list: () => [...countryKeys.all, "list"] as const,
  detail: (id: string | number) => [...countryKeys.all, "detail", id] as const,
};

// Query Hooks
export const useCountries = (options?: UseQueryOptions<Country[], Error>) =>
  useQuery({
    queryKey: countryKeys.list(),
    queryFn: CountryService.getAll,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useCountry = (id: string | number | null | undefined, options?: UseQueryOptions<Country, Error>) =>
  useQuery({
    queryKey: countryKeys.detail(id!),
    queryFn: () => CountryService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const filterCountries = (
  searchTerm: string,
  existingCountries: Country[] = []
) => {
  if (!searchTerm.trim()) return existingCountries;
  return CountryService.searchCountries(existingCountries, searchTerm);
};

// Generic Mutation Hook Factory
function useCountryMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context, meta);
      }
    },
  });
}

export const useCreateCountry = (options?: UseMutationOptions<Country, Error, CreateCountryRequest>) =>
  useCountryMutation<Country, CreateCountryRequest>(CountryService.create, options);

export const useUpdateCountry = (options?: UseMutationOptions<Country, Error, UpdateCountryRequest>) =>
  useCountryMutation<Country, UpdateCountryRequest>(CountryService.update, options);

export const useDeleteCountry = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCountryMutation<string | number, string | number>(CountryService.delete, options);

// Utility Hook
export const useInvalidateCountries = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: countryKeys.all });
};
