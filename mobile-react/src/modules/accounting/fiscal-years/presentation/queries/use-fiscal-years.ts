import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FiscalYearUseCases } from '../../application/fiscal-year-use-cases';
import { fiscalYearUseCases } from '../../composition/fiscal-year-container';
import type { FiscalYearLifecycleAction, FiscalYearPageQuery, FiscalYearRequest } from '../../domain/models/fiscal-year';
import { fiscalYearKeys } from './fiscal-year-keys';

export const useFiscalYears = (query: FiscalYearPageQuery) => useQuery({ queryKey: fiscalYearKeys.list(query), queryFn: () => fiscalYearUseCases.getPage(query), placeholderData: previous => previous });
export const useFiscalYear = (id: number | null, enabled: boolean) => useQuery({ queryKey: fiscalYearKeys.detail(id ?? 0), queryFn: () => fiscalYearUseCases.getById(id!), enabled: enabled && id !== null });
export const useFiscalYearLookup = () => useQuery({ queryKey: fiscalYearKeys.lookup(), queryFn: () => fiscalYearUseCases.getLookup(), staleTime: 60_000, refetchOnMount: 'always' });
function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (value: TVariables, useCases: FiscalYearUseCases) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation<TResult, Error, TVariables>({
    mutationFn: value => mutationFn(value, fiscalYearUseCases),
    onSuccess: async () => client.invalidateQueries({ queryKey: fiscalYearKeys.all }),
  });
}
export const useSaveFiscalYear = () => useInvalidatingMutation(({ id, request, rowVersion }: { id: number | null; request: FiscalYearRequest; rowVersion?: string }, useCases) => useCases.save({ id, request, rowVersion }));
export const useArchiveFiscalYear = () => useInvalidatingMutation((id: number, useCases) => useCases.archive(id));
export const useRestoreFiscalYear = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.restore(id, rowVersion));
export const useFiscalYearLifecycle = () => useInvalidatingMutation(({ id, rowVersion, action }: { id: number; rowVersion: string; action: FiscalYearLifecycleAction }, useCases) => useCases.lifecycle(id, rowVersion, action));
