import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fiscalYearApi } from '../api/fiscal-year-api';
import type { FiscalYearLifecycleAction, FiscalYearPageQuery, FiscalYearRequest } from '../types/fiscal-year';

export const fiscalYearKeys = { all: ['fiscal-years'] as const, list: (query: FiscalYearPageQuery) => [...fiscalYearKeys.all, 'list', query] as const, detail: (id: number) => [...fiscalYearKeys.all, 'detail', id] as const };
export const useFiscalYears = (query: FiscalYearPageQuery) => useQuery({ queryKey: fiscalYearKeys.list(query), queryFn: () => fiscalYearApi.getPage(query), placeholderData: previous => previous });
export const useFiscalYear = (id: number | null, enabled: boolean) => useQuery({ queryKey: fiscalYearKeys.detail(id ?? 0), queryFn: () => fiscalYearApi.getById(id!), enabled: enabled && id !== null });
function useInvalidatingMutation<T>(mutationFn: (value: T) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => client.invalidateQueries({ queryKey: fiscalYearKeys.all }) }); }
export const useSaveFiscalYear = () => useInvalidatingMutation(({ id, request, rowVersion }: { id: number | null; request: FiscalYearRequest; rowVersion?: string }) => id === null ? fiscalYearApi.create(request) : fiscalYearApi.update(id, request, rowVersion!));
export const useArchiveFiscalYear = () => useInvalidatingMutation((id: number) => fiscalYearApi.archive(id));
export const useRestoreFiscalYear = () => useInvalidatingMutation(({ id, rowVersion }: { id: number; rowVersion: string }) => fiscalYearApi.restore(id, rowVersion));
export const useFiscalYearLifecycle = () => useInvalidatingMutation(({ id, rowVersion, action }: { id: number; rowVersion: string; action: FiscalYearLifecycleAction }) => fiscalYearApi.lifecycle(id, rowVersion, action));
