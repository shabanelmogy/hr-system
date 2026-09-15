import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import StateService from "../services/stateService";
import type {
  BulkArchiveStatesResponse,
  CreateStateRequest,
  StateDetail,
  StateLookup,
  StatePageQuery,
  StatePageResponse,
  StateWithDistricts,
  UpdateStateMutation,
} from "../types/State";

// Query Keys
export const stateKeys = {
  all: ["states"] as const,
  pages: () => [...stateKeys.all, "page"] as const,
  page: (query: StatePageQuery) => [...stateKeys.pages(), query] as const,
  lookup: (countryId?: number) => [...stateKeys.all, "lookup", countryId ?? "all"] as const,
  details: () => [...stateKeys.all, "detail"] as const,
  detail: (id: number) => [...stateKeys.details(), id] as const,
  withDistricts: (id: number) => [...stateKeys.all, "districts", id] as const,
};

export const useStatePage = (
  query: StatePageQuery,
  options?: Omit<UseQueryOptions<StatePageResponse, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: stateKeys.page(query),
    queryFn: () => StateService.getPage(query),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    ...options,
  });

export const useStateLookup = (
  countryId?: number,
  options?: Omit<UseQueryOptions<StateLookup[], Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: stateKeys.lookup(countryId),
    queryFn: () => StateService.getLookup(countryId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useState = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<StateDetail, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: stateKeys.detail(id!),
    queryFn: () => StateService.getById(id!),
    enabled: id != null,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useStateWithDistricts = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<StateWithDistricts, Error>, "queryKey" | "queryFn">,
) => useQuery({
  queryKey: stateKeys.withDistricts(id!),
  queryFn: () => StateService.getWithDistricts(id!),
  enabled: id != null,
  staleTime: 5 * 60_000,
  ...options,
});

// Generic Mutation Hook Factory
function useStateMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, meta) => {
      await queryClient.invalidateQueries({ queryKey: stateKeys.all });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });
}

export const useCreateState = (options?: UseMutationOptions<StateDetail, Error, CreateStateRequest>) =>
  useStateMutation(StateService.create, options);

export const useUpdateState = (options?: UseMutationOptions<StateDetail, Error, UpdateStateMutation>) =>
  useStateMutation(StateService.update, options);

export const useArchiveState = (options?: UseMutationOptions<number, Error, number>) =>
  useStateMutation(StateService.archive, options);

export const useRestoreState = (options?: UseMutationOptions<number, Error, number>) =>
  useStateMutation(StateService.restore, options);

export const useBulkArchiveStates = (options?: UseMutationOptions<BulkArchiveStatesResponse, Error, number[]>) =>
  useStateMutation(StateService.archiveBulk, options);

// Utility Hook
export const useInvalidateStates = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: stateKeys.all });
};
