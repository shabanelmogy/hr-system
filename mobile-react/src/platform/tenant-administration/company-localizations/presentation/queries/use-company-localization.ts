import { useSystemLocalizationUseCases } from '../../composition/use-system-localization-use-cases';
import type { SystemLocalizationSettings } from '../../domain/models/system-localization';
import { useCallback, useMemo, useSyncExternalStore, type SetStateAction } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { companyUiGeneration, subscribeCompanyUiGeneration } from '@/src/core/localization';
import { useConnectivity } from '@/src/core/offline';
import { permissions, useAuth } from '@/src/platform/auth';
import { useServerListState } from '@/src/shared/listing';
import { useCompanyLocalizationUseCases } from '../../composition/use-company-localization-use-cases';
import type {
  CompanyLocalizationSettings, CompanyLocalizationTextQuery, SetCompanyLocalizationDefault,
  SetCompanyLocalizationText, ResetCompanyLocalizationText,
} from '../../domain/models/company-localization';

type Filters = Pick<CompanyLocalizationTextQuery, 'source' | 'baseLanguage' | 'targetLanguage' | 'status'>;
export const companyLocalizationKeys = {
  scope: (tenantId: string, companyId: number, userId: string) =>
    ['company-localizations', tenantId, companyId, userId] as const,
};

function useCompanyScope() {
  const { session, isServerAuthenticated, isSwitchingCompany } = useAuth();
  const { isOnline } = useConnectivity();
  const enabled = isServerAuthenticated && !isSwitchingCompany && isOnline && Boolean(session?.tenantId && session.companyId > 0)&&!session?.roles?.includes('super_admin');
  const scope = { tenantId: session?.tenantId ?? '', companyId: session?.companyId ?? 0 };
  const key = companyLocalizationKeys.scope(scope.tenantId, scope.companyId, session?.userId ?? '');
  return { enabled, scope, key, session };
}

export function useCompanyLocalization(system=false) {
  const company=useCompanyScope();
  const {session,isServerAuthenticated,isSwitchingCompany}=useAuth();const {isOnline}=useConnectivity();
  const globalEnabled=isServerAuthenticated&&!isSwitchingCompany&&isOnline&&Boolean(session?.roles?.includes('super_admin'));
  const enabled=system?globalEnabled:company.enabled;
  const scope=company.scope;
  const key=system?['system-ui-localizations',session?.userId,[...(session?.permissions??[])].sort().join('|')]:company.key;
  const systemCases=useSystemLocalizationUseCases();
  const useCases = useCompanyLocalizationUseCases();
  const queryClient = useQueryClient();
  const canView = enabled && Boolean(session?.permissions.includes(system?permissions.ViewSystemUiTexts:permissions.ViewCompanyLocalizations));
  const settingsQuery = useQuery<CompanyLocalizationSettings|SystemLocalizationSettings>({ queryKey: [...key, 'settings'], queryFn: () => system?systemCases.getSettings():useCases.getSettings(scope), enabled: canView });
  const list = useServerListState<string, Filters>({
    initialPageSize: 25,
    initialFilters: { source: '', baseLanguage: 'en', targetLanguage: 'ar', status: 'all' },
  });
  const requestedSource = list.state.filters.source;
  const configuredSources = settingsQuery.data?.sources;
  const source = !configuredSources ? ''
    : requestedSource && configuredSources.some((item) => item.id === requestedSource) ? requestedSource
      : configuredSources.find((item) => item.client === 'mobile')?.id || configuredSources[0]?.id || '';
  const query: CompanyLocalizationTextQuery = useMemo(() => ({
    ...list.state.filters, source, search: list.searchInput, page: list.state.page + 1, pageSize: list.state.pageSize,
  }), [list.state.filters, list.state.page, list.state.pageSize, list.searchInput, source]);
  const serverQuery = { ...query, search: list.state.search };
  const textsQuery = useQuery({
    queryKey: [...key, 'texts', serverQuery], queryFn: () => system?systemCases.getTexts(serverQuery):useCases.getTexts(serverQuery), enabled: canView && settingsQuery.isSuccess && source.length > 0,
  });
  const setQuery = useCallback((action: SetStateAction<CompanyLocalizationTextQuery>) => {
    const next = typeof action === 'function' ? action(query) : action;
    if (next.search !== query.search) list.setSearchInput(next.search);
    if (next.source !== query.source || next.baseLanguage !== query.baseLanguage || next.targetLanguage !== query.targetLanguage || next.status !== query.status) {
      list.setFilters({ source: next.source, baseLanguage: next.baseLanguage, targetLanguage: next.targetLanguage, status: next.status });
    } else if (next.pageSize !== query.pageSize) list.setPageSize(next.pageSize);
    else if (next.page !== query.page) list.setPage(next.page - 1);
  }, [list, query]);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  const requireWrite = (permission: string) => {
    if ((system&&!canView)||!enabled || session?.tenantReadOnly || !session?.permissions.includes(permission)) throw new Error('Company localization write is unavailable.');
  };
  const setDefault = useMutation({
    mutationFn: (request: SetCompanyLocalizationDefault) => { if(system)throw new Error('Global defaults are not editable.');requireWrite(permissions.SetCompanyLocalizationDefault); return useCases.setDefault(request); },
    networkMode: 'always', onSuccess: invalidate,
  });
  const setText = useMutation({
    mutationFn: (request: SetCompanyLocalizationText) => { requireWrite(system?permissions.EditSystemUiTexts:permissions.EditCompanyLocalizations); return system?systemCases.setText(request):useCases.setText(request); },
    networkMode: 'always', onSuccess: invalidate,
  });
  const resetText = useMutation({
    mutationFn: (request: ResetCompanyLocalizationText) => { requireWrite(system?permissions.ResetSystemUiTexts:permissions.ResetCompanyLocalizations); return system?systemCases.resetText(request):useCases.resetText(request); },
    networkMode: 'always', onSuccess: invalidate,
  });
  return { settings: settingsQuery.data, texts: textsQuery.data, query, setQuery, settingsQuery, textsQuery, setDefault, setText, resetText };
}

export function useCompanyLocalizationRuntime() {
  const { enabled, scope, key } = useCompanyScope();
  const generation = useSyncExternalStore(subscribeCompanyUiGeneration, companyUiGeneration, companyUiGeneration);
  const useCases = useCompanyLocalizationUseCases();
  const runtime = useQuery({
    queryKey: [...key, 'runtime', generation], enabled,
    queryFn: async () => {
      const started = companyUiGeneration();
      const result = await useCases.getRuntime(scope);
      if (started !== companyUiGeneration()) throw new Error('Discarded a previous company localization response.');
      return result;
    },
    staleTime: 30_000, refetchInterval: 60_000, retry: 1,
  });
  return { runtime, generation, enabled, scope };
}

export function useSystemLocalizationRuntime(){
 const {session,isServerAuthenticated,isSwitchingCompany}=useAuth();const {isOnline}=useConnectivity();
 const generation=useSyncExternalStore(subscribeCompanyUiGeneration,companyUiGeneration,companyUiGeneration);
 const useCases=useSystemLocalizationUseCases();const signature=[...(session?.permissions??[])].sort().join('|');
 const enabled=isServerAuthenticated&&!isSwitchingCompany&&isOnline&&Boolean(session?.roles?.includes('super_admin'));
 const runtime=useQuery({queryKey:['system-ui-localizations',session?.userId,signature,'runtime',generation],enabled,
 queryFn:async()=>{const started=companyUiGeneration();const result=await useCases.getRuntime();if(started!==companyUiGeneration())throw new Error('Global UI actor changed.');return result;},staleTime:30000,refetchInterval:60000,retry:1});
 return {runtime,generation,enabled,signature,permissions:session?.permissions};
}
