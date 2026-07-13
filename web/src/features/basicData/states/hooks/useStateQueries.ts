import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import StateService from "../services/stateService";
import { State, CreateStateRequest, UpdateStateRequest } from "../types/State";

// Query Keys
export const stateKeys = {
  all: ["states"] as const,
  list: () => [...stateKeys.all, "list"] as const,
  detail: (id: string | number) => [...stateKeys.all, "detail", id] as const,
  byCountry: (countryId: string | number) => [...stateKeys.all, "by-country", countryId] as const,
};

// Query Hooks
export const useStates = (options?: UseQueryOptions<State[], Error>) =>
  useQuery({
    queryKey: stateKeys.list(),
    queryFn: StateService.getAll,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useState = (id: string | number | null | undefined, options?: UseQueryOptions<State, Error>) =>
  useQuery({
    queryKey: stateKeys.detail(id!),
    queryFn: () => StateService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useStatesByCountry = (countryId: string | number | null | undefined, options?: UseQueryOptions<State[], Error>) =>
  useQuery({
    queryKey: stateKeys.byCountry(countryId!),
    queryFn: () => StateService.getByCountry(countryId!),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useStateSearch = (
  searchTerm: string,
  existingStates: State[] = []
) =>
  useMemo(() => {
    if (!searchTerm.trim()) return existingStates;
    return StateService.searchStates(existingStates, searchTerm);
  }, [searchTerm, existingStates]);

// Generic Mutation Hook Factory
function useStateMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: stateKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context, meta);
      }
    },
  });
}

export const useCreateState = (options?: UseMutationOptions<State, Error, CreateStateRequest>) =>
  useStateMutation(StateService.create, options);

export const useUpdateState = (options?: UseMutationOptions<State, Error, UpdateStateRequest>) =>
  useStateMutation(StateService.update, options);

export const useDeleteState = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useStateMutation<string | number, string | number>(StateService.delete, options);

// Utility Hook
export const useInvalidateStates = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: stateKeys.all });
};

// Legacy exports for backward compatibility
export const stateQueryKeys = stateKeys;