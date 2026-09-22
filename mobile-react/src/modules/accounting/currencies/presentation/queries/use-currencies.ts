import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CurrencyUseCases } from '../../application/currency-use-cases';
import { currencyUseCases } from '../../composition/currency-container';
import type { CurrencyPageQuery, CurrencyRequest } from '../../domain/models/currency';
import { currencyKeys } from './currency-keys';

export const useCurrencies = (query: CurrencyPageQuery) => useQuery({ queryKey: currencyKeys.list(query), queryFn: () => currencyUseCases.getPage(query), placeholderData: previous => previous });
export const useCurrency = (id: number | null, enabled: boolean) => useQuery({ queryKey: currencyKeys.detail(id ?? 0), queryFn: () => currencyUseCases.getById(id!), enabled: enabled && id !== null });
export const useCurrencyLookup = (enabled = true) => useQuery({ queryKey: currencyKeys.lookup(), queryFn: () => currencyUseCases.getLookup(), enabled, staleTime: 60_000, refetchOnMount: 'always' });

function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (value: TVariables, useCases: CurrencyUseCases) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation<TResult, Error, TVariables>({ mutationFn: value => mutationFn(value, currencyUseCases), onSuccess: async () => client.invalidateQueries({ queryKey: currencyKeys.all }) });
}

export const useSaveCurrency = () => useInvalidatingMutation(({ id, request, rowVersion }: { id: number | null; request: CurrencyRequest; rowVersion?: string }, useCases) => useCases.save({ id, request, rowVersion }));
export const useArchiveCurrency = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.archive(id, rowVersion));
export const useRestoreCurrency = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }, useCases) => useCases.restore(id, rowVersion));
