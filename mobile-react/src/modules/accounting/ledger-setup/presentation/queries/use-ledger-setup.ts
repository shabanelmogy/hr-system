import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ledgerSetupUseCases as useCases } from '../../composition/ledger-setup-container';
import type { LedgerSetupEntity, LedgerSetupFormValues, LedgerSetupOptionSource, LedgerSetupRecord, ResolveAccountPreviewRequest } from '../../domain/models/ledger-setup';

export const ledgerSetupKeys = {
  all: ['accounting', 'ledger-setup'] as const,
  list: (entity: LedgerSetupEntity, scopeId?: number, page = 0, pageSize = 50, search = '') => [...ledgerSetupKeys.all, entity, scopeId ?? null, page, pageSize, search] as const,
  lookups: () => [...ledgerSetupKeys.all, 'lookups'] as const,
};

export const useLedgerSetupList = (entity: LedgerSetupEntity, scopeId?: number, enabled = true, page = 0, pageSize = 50, search = '') => useQuery({
  queryKey: ledgerSetupKeys.list(entity, scopeId, page, pageSize, search),
  queryFn: () => useCases.list(entity, scopeId, page + 1, pageSize, search),
  enabled,
});
export const useLedgerSetupAccountTree = (enabled = true) => useQuery({
  queryKey: [...ledgerSetupKeys.all, 'account-tree'],
  queryFn: () => useCases.accountTree(),
  enabled,
});
export const getLedgerSetupAccount = (id: number) => useCases.account(id);

export const useLedgerSetupLookups = (sources: readonly LedgerSetupOptionSource[] = [], enabled = true) => useQuery({
  queryKey: [...ledgerSetupKeys.lookups(), sources],
  queryFn: () => useCases.lookups(sources),
  enabled: enabled && sources.length > 0,
  staleTime: 60_000,
});

function useInvalidatingMutation<TVariables, TResult>(mutationFn: (value: TVariables) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation<TResult, Error, TVariables>({
    mutationFn,
    onSuccess: async () => client.invalidateQueries({ queryKey: ledgerSetupKeys.all }),
  });
}

export const useSaveLedgerSetup = () => useInvalidatingMutation(
  ({ entity, id, request }: { entity: LedgerSetupEntity; id: number | null; request: LedgerSetupFormValues }) => useCases.save(entity, id, request),
);
export const useArchiveLedgerSetup = () => useInvalidatingMutation(
  ({ entity, item }: { entity: LedgerSetupEntity; item: LedgerSetupRecord }) => useCases.archive(entity, item),
);
export const useRestoreLedgerSetup = () => useInvalidatingMutation(
  ({ entity, item }: { entity: LedgerSetupEntity; item: LedgerSetupRecord }) => useCases.restore(entity, item),
);
export const useResolveAccountPreview = () => useMutation({ mutationFn: (request: ResolveAccountPreviewRequest) => useCases.resolvePreview(request) });
