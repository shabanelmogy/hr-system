import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import AddressTypeService from "../services/addressTypeService";
import { AddressType, CreateAddressTypeRequest, UpdateAddressTypeRequest } from "../types/AddressType";

// Query Keys
export const addressTypeKeys = {
  all: ["addressTypes"] as const,
  list: () => [...addressTypeKeys.all, "list"] as const,
  detail: (id: string | number) => [...addressTypeKeys.all, "detail", id] as const,
};

// Query Hooks
export const useAddressTypes = (options?: UseQueryOptions<AddressType[], Error>) =>
  useQuery({
    queryKey: addressTypeKeys.list(),
    queryFn: AddressTypeService.getAll,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useAddressType = (id: string | number | null | undefined, options?: UseQueryOptions<AddressType, Error>) =>
  useQuery({
    queryKey: addressTypeKeys.detail(id!),
    queryFn: () => AddressTypeService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export const useAddressTypeSearch = (
  searchTerm: string,
  existingItems: AddressType[] = []
) =>
  useMemo(() => {
    if (!searchTerm.trim()) return existingItems;
    return AddressTypeService.search(existingItems, searchTerm);
  }, [searchTerm, existingItems]);

// Generic Mutation Hook Factory
function useAddressTypeMutation<TData = unknown, TVariables = unknown, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, meta) => {
      queryClient.invalidateQueries({ queryKey: addressTypeKeys.all });
      if (options && typeof options.onSuccess === "function") {
        options.onSuccess(data, variables, context, meta);
      }
    },
  });
}

export const useCreateAddressType = (options?: UseMutationOptions<AddressType, Error, CreateAddressTypeRequest>) =>
  useAddressTypeMutation(AddressTypeService.create, options);

export const useUpdateAddressType = (options?: UseMutationOptions<AddressType, Error, UpdateAddressTypeRequest>) =>
  useAddressTypeMutation(AddressTypeService.update, options);

export const useDeleteAddressType = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useAddressTypeMutation<string | number, string | number>(AddressTypeService.delete, options);

// Utility Hook
export const useInvalidateAddressTypes = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: addressTypeKeys.all });
};
