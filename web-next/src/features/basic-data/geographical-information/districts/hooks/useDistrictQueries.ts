import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import DistrictService from "../services/districtService";
import type {
  BulkArchiveDistrictsResponse,
  CreateDistrictRequest,
  DistrictDetail,
  DistrictLookup,
  DistrictPageQuery,
  DistrictPageResponse,
  DistrictWithAddresses,
  UpdateDistrictMutation,
} from "../types/District";

// Query Keys
export const districtKeys = {
  all: ["districts"] as const,
  pages: () => [...districtKeys.all, "page"] as const,
  page: (query: DistrictPageQuery) => [...districtKeys.pages(), query] as const,
  lookup: (stateId?: number) => [...districtKeys.all, "lookup", stateId ?? "all"] as const,
  details: () => [...districtKeys.all, "detail"] as const,
  detail: (id: number) => [...districtKeys.details(), id] as const,
  withAddresses: (id: number) => [...districtKeys.all, "addresses", id] as const,
};

export const useDistrictPage = (
  query: DistrictPageQuery,
  options?: Omit<UseQueryOptions<DistrictPageResponse, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: districtKeys.page(query),
    queryFn: () => DistrictService.getPage(query),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    ...options,
  });

export const useDistrictLookup = (
  stateId?: number,
  options?: Omit<UseQueryOptions<DistrictLookup[], Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: districtKeys.lookup(stateId),
    queryFn: () => DistrictService.getLookup(stateId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrict = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<DistrictDetail, Error>, "queryKey" | "queryFn">,
) =>
  useQuery({
    queryKey: districtKeys.detail(id!),
    queryFn: () => DistrictService.getById(id!),
    enabled: id != null,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrictWithAddresses = (
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<DistrictWithAddresses, Error>, "queryKey" | "queryFn">,
) => useQuery({
  queryKey: districtKeys.withAddresses(id!),
  queryFn: () => DistrictService.getWithAddresses(id!),
  enabled: id != null,
  staleTime: 5 * 60_000,
  ...options,
});

// Generic Mutation Hook Factory
function useDistrictMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, meta) => {
      await queryClient.invalidateQueries({ queryKey: districtKeys.all });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });
}

export const useCreateDistrict = (options?: UseMutationOptions<DistrictDetail, Error, CreateDistrictRequest>) =>
  useDistrictMutation(DistrictService.create, options);

export const useUpdateDistrict = (options?: UseMutationOptions<DistrictDetail, Error, UpdateDistrictMutation>) =>
  useDistrictMutation(DistrictService.update, options);

export const useArchiveDistrict = (options?: UseMutationOptions<number, Error, number>) =>
  useDistrictMutation(DistrictService.archive, options);

export const useRestoreDistrict = (options?: UseMutationOptions<number, Error, number>) =>
  useDistrictMutation(DistrictService.restore, options);

export const useBulkArchiveDistricts = (options?: UseMutationOptions<BulkArchiveDistrictsResponse, Error, number[]>) =>
  useDistrictMutation(DistrictService.archiveBulk, options);

// Utility Hook
export const useInvalidateDistricts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: districtKeys.all });
};
