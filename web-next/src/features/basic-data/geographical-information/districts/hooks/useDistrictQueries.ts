import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import DistrictService from "../services/districtService";
import { District, CreateDistrictRequest, UpdateDistrictRequest } from "../types/District";

// Query Keys
export const districtKeys = {
  all: ["districts"] as const,
  list: () => [...districtKeys.all, "list"] as const,
  listByState: (stateId: string | number) => [...districtKeys.all, "listByState", stateId] as const,
  detail: (id: string | number) => [...districtKeys.all, "detail", id] as const,
  count: () => [...districtKeys.all, "count"] as const,
};

// Query Hooks
export const useDistricts = (options?: UseQueryOptions<District[], Error>) =>
  useQuery({
    queryKey: districtKeys.list(),
    queryFn: DistrictService.getAll,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrictsByState = (stateId: string | number | null | undefined, options?: UseQueryOptions<District[], Error>) =>
  useQuery({
    queryKey: districtKeys.listByState(stateId!),
    queryFn: () => DistrictService.getAllByState(stateId!),
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrict = (id: string | number | null | undefined, options?: UseQueryOptions<District, Error>) =>
  useQuery({
    queryKey: districtKeys.detail(id!),
    queryFn: () => DistrictService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrictWithAddresses = (id: string | number | null | undefined, options?: UseQueryOptions<District, Error>) =>
  useQuery({
    queryKey: [...districtKeys.detail(id!), "withAddresses"],
    queryFn: () => DistrictService.getDistrictWithAddresses(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrictCount = (options?: UseQueryOptions<number, Error>) =>
  useQuery({
    queryKey: districtKeys.count(),
    queryFn: DistrictService.getCount,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useDistrictSearch = (
  searchTerm: string,
  existingDistricts: District[] = []
) =>
  useMemo(() => {
    if (!searchTerm.trim()) return existingDistricts;
    return DistrictService.searchDistricts(existingDistricts, searchTerm);
  }, [searchTerm, existingDistricts]);

// Generic Mutation Hook Factory
function useDistrictMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: districtKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context, meta);
      }
    },
  });
}

export const useCreateDistrict = (options?: UseMutationOptions<District, Error, CreateDistrictRequest>) =>
  useDistrictMutation<District, CreateDistrictRequest>(DistrictService.create, options);

export const useUpdateDistrict = (options?: UseMutationOptions<District, Error, UpdateDistrictRequest>) =>
  useDistrictMutation<District, UpdateDistrictRequest>(DistrictService.update, options);

export const useDeleteDistrict = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useDistrictMutation<string | number, string | number>(DistrictService.delete, options);

// Utility Hook
export const useInvalidateDistricts = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: districtKeys.all });
};