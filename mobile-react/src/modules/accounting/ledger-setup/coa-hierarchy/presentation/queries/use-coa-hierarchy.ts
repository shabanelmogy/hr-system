import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/src/core/api';
import type { CoaHierarchyUseCases } from '../../application/coa-hierarchy-use-cases';
import { coaHierarchyUseCases } from '../../composition/coa-hierarchy-container';
import type { AccountHierarchyLevelRequest, AccountPageQuery, AccountRecordStatus, AccountRequest } from '../../domain/models/coa-hierarchy';
import { coaHierarchyKeys } from './coa-hierarchy-keys';

async function reconcileAfterFailure(client: ReturnType<typeof useQueryClient>, error: Error) {
  if (error instanceof ApiError && (error.status === 0 || (error.status === 409 && error.problem?.code === 'Accounting.ConcurrencyConflict'))) {
    await client.invalidateQueries({ queryKey: coaHierarchyKeys.all });
  }
}

function useInvalidatingMutation<TVariables, TResult>(mutationFn: (value: TVariables, useCases: CoaHierarchyUseCases) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation<TResult, Error, TVariables>({
    mutationFn: value => mutationFn(value, coaHierarchyUseCases),
    onSuccess: async () => client.invalidateQueries({ queryKey: coaHierarchyKeys.all }),
    onError: async error => reconcileAfterFailure(client, error),
  });
}

export const useAccountPage = (query: AccountPageQuery, enabled = true) => useQuery({ queryKey: coaHierarchyKeys.accountList(query), queryFn: () => coaHierarchyUseCases.getAccountPage(query), placeholderData: previous => previous, enabled });
export const useAccountTree = (enabled = true) => useQuery({ queryKey: coaHierarchyKeys.accountTree(), queryFn: () => coaHierarchyUseCases.getAccountTree(), enabled });
export const useAccountDetail = (id: number | null, enabled: boolean) => useQuery({ queryKey: coaHierarchyKeys.accountDetail(id ?? 0), queryFn: () => coaHierarchyUseCases.getAccount(id!), enabled: enabled && id !== null, staleTime: Number.POSITIVE_INFINITY });
export const useFreshAccountDetail = () => {
  const client = useQueryClient();
  return useCallback(async (id: number) => {
    const detail = await coaHierarchyUseCases.getAccount(id);
    client.setQueryData(coaHierarchyKeys.accountDetail(id), detail);
    return detail;
  }, [client]);
};
export const useAccountLookup = (enabled = true) => useQuery({ queryKey: coaHierarchyKeys.accountLookup(), queryFn: () => coaHierarchyUseCases.getAccountLookup(), enabled, staleTime: 60_000, refetchOnMount: 'always' });
export const useAccountCodeProposal = (enabled: boolean, session: number) => useQuery({ queryKey: coaHierarchyKeys.accountCodeProposal(session), queryFn: () => coaHierarchyUseCases.getAccountCodeProposal(), enabled, staleTime: 0, refetchOnMount: 'always' });
export const useHierarchyLevels = (recordStatus: AccountRecordStatus, enabled = true) => useQuery({ queryKey: coaHierarchyKeys.hierarchyLevels(recordStatus), queryFn: () => coaHierarchyUseCases.getHierarchyLevels(recordStatus), enabled });

export const useSaveAccount = () => useInvalidatingMutation(({ id, request, rowVersion }: { id: number | null; request: AccountRequest; rowVersion?: string }, useCases) => useCases.saveAccount({ id, request, rowVersion }));
export const useArchiveAccount = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.archiveAccount(id, rowVersion));
export const useRestoreAccount = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.restoreAccount(id, rowVersion));
export const useSaveHierarchyLevel = () => useInvalidatingMutation(({ id, request, rowVersion }: { id: number | null; request: AccountHierarchyLevelRequest; rowVersion?: string }, useCases) => useCases.saveHierarchyLevel({ id, request, rowVersion }));
export const useArchiveHierarchyLevel = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.archiveHierarchyLevel(id, rowVersion));
export const useRestoreHierarchyLevel = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.restoreHierarchyLevel(id, rowVersion));
