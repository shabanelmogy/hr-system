import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import AddressTypeService from "../services/addressTypeService";
import type { AddressTypeDetail, AddressTypePageQuery, CreateAddressTypeRequest, UpdateAddressTypeMutation } from "../types/AddressType";
import { addressTypeKeys } from "./addressTypeQueryKeys";

export { addressTypeKeys } from "./addressTypeQueryKeys";

export const useAddressTypePage = (query: AddressTypePageQuery) => useQuery({ queryKey: addressTypeKeys.page(query), queryFn: () => AddressTypeService.getPage(query), placeholderData: (previous) => previous });

function useInvalidatingMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, ...options, onSuccess: async (data, variables, onMutateResult, mutationContext) => { await queryClient.invalidateQueries({ queryKey: addressTypeKeys.all }); await options?.onSuccess?.(data, variables, onMutateResult, mutationContext); } });
}
export const useCreateAddressType = (options?: UseMutationOptions<AddressTypeDetail, Error, CreateAddressTypeRequest>) => useInvalidatingMutation(AddressTypeService.create, options);
export const useUpdateAddressType = (options?: UseMutationOptions<AddressTypeDetail, Error, UpdateAddressTypeMutation>) => useInvalidatingMutation(AddressTypeService.update, options);
export const useArchiveAddressType = () => useInvalidatingMutation(AddressTypeService.archive);
export const useRestoreAddressType = () => useInvalidatingMutation(AddressTypeService.restore);
export const useBulkArchiveAddressTypes = () => useInvalidatingMutation(AddressTypeService.bulkArchive);
export const useBulkCreateAddressTypes = () => useInvalidatingMutation(AddressTypeService.bulkCreate);
export const useInvalidateAddressTypes = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: addressTypeKeys.all }); };
