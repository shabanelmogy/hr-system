import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AddressTypeUseCases } from '../../application/address-type-use-cases';
import { useAddressTypeUseCases } from '../../composition/use-address-type-use-cases';
import type { AddressTypePageQuery, AddressTypeRequest } from '../../domain/models/address-type';
import { addressTypeKeys } from './address-type-keys';

export function useAddressTypes(query: AddressTypePageQuery) {
  const useCases = useAddressTypeUseCases();
  return useQuery({
    queryKey: addressTypeKeys.list(query),
    queryFn: () => useCases.getPage(query),
    placeholderData: (previous) => previous,
    networkMode: 'always',
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables, useCases: AddressTypeUseCases) => Promise<TResult>,
) {
  const useCases = useAddressTypeUseCases();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(variables, useCases),
    onSuccess: async () => client.invalidateQueries({ queryKey: addressTypeKeys.all }),
    networkMode: 'always',
  });
}

export function useSaveAddressType() {
  return useInvalidatingMutation(
    ({ id, request }: { id: number | null; request: AddressTypeRequest }, useCases) =>
      useCases.save({ id, request }),
  );
}

export function useArchiveAddressType() {
  return useInvalidatingMutation((id: number, useCases) => useCases.archive(id));
}

export function useRestoreAddressType() {
  return useInvalidatingMutation((id: number, useCases) => useCases.restore(id));
}

export function useBulkArchiveAddressTypes() {
  return useInvalidatingMutation((ids: number[], useCases) => useCases.bulkArchive(ids));
}

export function useBulkCreateAddressTypes() {
  return useInvalidatingMutation((requests: AddressTypeRequest[], useCases) => useCases.bulkCreate(requests));
}
