import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressTypeApi } from '../api/address-type-api';
import { addressTypeKeys } from './address-type-keys';
import type { AddressTypePageQuery, AddressTypeRequest } from '../types/address-type';

export function useAddressTypes(query: AddressTypePageQuery) { return useQuery({ queryKey: addressTypeKeys.list(query), queryFn: () => addressTypeApi.getPage(query), placeholderData: (previous) => previous }); }
function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (variables: TVariables) => Promise<TResult>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => client.invalidateQueries({ queryKey: addressTypeKeys.all }) }); }
export function useSaveAddressType() { return useInvalidatingMutation(({ id, request }: { id: number | null; request: AddressTypeRequest }) => id === null ? addressTypeApi.create(request) : addressTypeApi.update(id, request)); }
export function useArchiveAddressType() { return useInvalidatingMutation((id: number) => addressTypeApi.archive(id)); }
export function useRestoreAddressType() { return useInvalidatingMutation((id: number) => addressTypeApi.restore(id)); }
export function useBulkArchiveAddressTypes() { return useInvalidatingMutation((ids: number[]) => addressTypeApi.bulkArchive(ids)); }
export function useBulkCreateAddressTypes() { return useInvalidatingMutation((requests: AddressTypeRequest[]) => addressTypeApi.bulkCreate(requests)); }
