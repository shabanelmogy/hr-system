import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import AddressTypeService from "../services/addressTypeService";
import type { AddressType, AddressTypePageQuery, CreateAddressTypeRequest, UpdateAddressTypeRequest } from "../types/AddressType";

export const addressTypeKeys = {
  all: ["addressTypes"] as const,
  list: () => [...addressTypeKeys.all, "list"] as const,
  page: (query: AddressTypePageQuery) => [...addressTypeKeys.list(), query] as const,
  detail: (id: string | number) => [...addressTypeKeys.all, "detail", id] as const,
  reports: () => [...addressTypeKeys.all, "reports"] as const,
};

export const useAddressTypePage = (query: AddressTypePageQuery) => useQuery({ queryKey: addressTypeKeys.page(query), queryFn: () => AddressTypeService.getPage(query), placeholderData: (previous) => previous });
export const useAddressTypes = (options?: UseQueryOptions<AddressType[], Error>) => useQuery({ queryKey: addressTypeKeys.list(), queryFn: AddressTypeService.getAll, staleTime: 5 * 60_000, ...options });
export const useAddressType = (id: string | number | null | undefined, options?: UseQueryOptions<AddressType, Error>) => useQuery({ queryKey: addressTypeKeys.detail(id ?? 0), queryFn: async () => ({ ...(await AddressTypeService.getById(id!)), addressesCount: 0 }), enabled: !!id, staleTime: 5 * 60_000, ...options });
export const useAddressTypeSearch = (searchTerm: string, existingItems: AddressType[] = []) => useMemo(() => AddressTypeService.search(existingItems, searchTerm), [existingItems, searchTerm]);

function useInvalidatingMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, ...options, onSuccess: async (data, variables, onMutateResult, mutationContext) => { await queryClient.invalidateQueries({ queryKey: addressTypeKeys.all }); await options?.onSuccess?.(data, variables, onMutateResult, mutationContext); } });
}
const detailToList = (item: { id: number; nameAr: string; nameEn: string; createdOn: string; updatedOn: string | null; isDeleted: boolean }): AddressType => ({ ...item, addressesCount: 0 });
export const useCreateAddressType = (options?: UseMutationOptions<AddressType, Error, CreateAddressTypeRequest>) => useInvalidatingMutation(async (request) => detailToList(await AddressTypeService.create(request)), options);
export const useUpdateAddressType = (options?: UseMutationOptions<AddressType, Error, UpdateAddressTypeRequest>) => useInvalidatingMutation(async (request) => detailToList(await AddressTypeService.update(request)), options);
export const useDeleteAddressType = (options?: UseMutationOptions<string | number, Error, string | number>) => useInvalidatingMutation(AddressTypeService.archive, options);
export const useArchiveAddressType = () => useInvalidatingMutation(AddressTypeService.archive);
export const useRestoreAddressType = () => useInvalidatingMutation(AddressTypeService.restore);
export const useBulkArchiveAddressTypes = () => useInvalidatingMutation(AddressTypeService.bulkArchive);
export const useBulkCreateAddressTypes = () => useInvalidatingMutation(AddressTypeService.bulkCreate);
export const useInvalidateAddressTypes = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: addressTypeKeys.all }); };
