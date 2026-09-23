import { ApiError, apiService } from '@/src/core/api';
import type {
  LedgerSetupEntity,
  LedgerSetupFormValues,
  LedgerSetupOptionSource,
  LedgerSetupRecord,
  ResolveAccountPreviewRequest,
  ResolveAccountPreviewResponse,
} from '../../domain/models/ledger-setup';
import { ledgerSetupEndpoints as endpoints } from './ledger-setup-endpoints';
import { ledgerSetupRecordListSchema, ledgerSetupRecordSchema, resolveAccountPreviewSchema } from './ledger-setup-schemas';

const lookupParams = { recordStatus: 'active', pageNumber: 1, pageSize: 500 };

async function dimensionOptions(): Promise<LedgerSetupRecord[]> {
  const items: LedgerSetupRecord[] = [];
  for (let pageNumber = 1; ; pageNumber++) {
    const page = ledgerSetupRecordListSchema.parse(await apiService.get<unknown>(endpoints.dimensions.base, { params: { ...lookupParams, pageNumber } }));
    items.push(...page);
    if (page.length < lookupParams.pageSize) return items;
  }
}

function baseUrl(entity: LedgerSetupEntity): string {
  switch (entity) {
    case 'settings': return endpoints.settings;
    case 'accounts': return endpoints.accounts.base;
    case 'hierarchyLevels': return endpoints.accounts.hierarchyLevels;
    case 'dimensionDefinitions': return endpoints.dimensions.base;
    case 'dimensionValues': return endpoints.dimensions.valuesBase;
    case 'dimensionPolicies': return endpoints.dimensions.policiesBase;
    case 'books': return endpoints.books;
    case 'journals': return endpoints.journals;
    case 'exchangeRateTypes': return endpoints.exchangeRateTypes;
    case 'exchangeRates': return endpoints.exchangeRates;
    case 'accountMappings': return endpoints.accountMappings;
    case 'postingProfiles': return endpoints.postingProfiles;
  }
}

function itemUrl(entity: LedgerSetupEntity, id: number): string {
  return endpoints.byId(baseUrl(entity), id);
}

export const ledgerSetupRemoteDataSource = {
  async list(entity: LedgerSetupEntity, scopeId?: number, pageNumber = 1, pageSize = 50, search?: string): Promise<LedgerSetupRecord[]> {
    try {
      if (entity === 'settings') {
        return [ledgerSetupRecordSchema.parse(await apiService.get<unknown>(endpoints.settings))];
      }
      const params = { recordStatus: 'all', pageNumber, pageSize, ...(search && (entity === 'accounts' || entity === 'dimensionDefinitions') ? { search } : {}) };
      if (entity === 'dimensionValues') {
        if (!scopeId) return [];
        return ledgerSetupRecordListSchema.parse(await apiService.get<unknown>(endpoints.dimensions.values(scopeId), { params }));
      }
      if (entity === 'dimensionPolicies') {
        if (!scopeId) return [];
        return ledgerSetupRecordListSchema.parse(await apiService.get<unknown>(endpoints.dimensions.policies(scopeId)));
      }
      return ledgerSetupRecordListSchema.parse(await apiService.get<unknown>(baseUrl(entity), { params }));
    } catch (error) {
      if (entity === 'settings' && error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  },

  async account(id: number): Promise<LedgerSetupRecord> {
    return ledgerSetupRecordSchema.parse(await apiService.get<unknown>(endpoints.byId(endpoints.accounts.base, id)));
  },

  async accountTree(): Promise<LedgerSetupRecord[]> {
    const roots = ledgerSetupRecordListSchema.parse(await apiService.get<unknown>(endpoints.accounts.tree));
    const flatten = (nodes: LedgerSetupRecord[], parentAccountId: number | null): LedgerSetupRecord[] => nodes.flatMap((node) => [
      { ...node, parentAccountId },
      ...flatten(ledgerSetupRecordListSchema.parse(node.children ?? []), node.id ?? null),
    ]);
    return flatten(roots, null);
  },

  async lookups(sources: readonly LedgerSetupOptionSource[] = ['accounts', 'books', 'currencies', 'dimensions', 'exchangeRateTypes', 'hierarchyLevels']): Promise<Record<string, LedgerSetupRecord[]>> {
    const requests: Partial<Record<LedgerSetupOptionSource, Promise<unknown>>> = {};
    for (const source of sources) {
      requests[source] = source === 'accounts'
        ? apiService.get<unknown>(endpoints.accounts.lookup)
        : source === 'books'
          ? apiService.get<unknown>(endpoints.books, { params: { recordStatus: 'active' } })
          : source === 'currencies'
            ? apiService.get<unknown>(endpoints.currenciesLookup)
            : source === 'dimensions'
              ? dimensionOptions()
              : source === 'exchangeRateTypes'
                ? apiService.get<unknown>(endpoints.exchangeRateTypes, { params: { recordStatus: 'active' } })
                : apiService.get<unknown>(endpoints.accounts.hierarchyLevels, { params: { recordStatus: 'active' } });
    }
    const values = await Promise.all(Object.entries(requests).map(async ([source, request]) => [source, ledgerSetupRecordListSchema.parse(await request!)] as const));
    return Object.fromEntries(values);
  },

  async save(entity: LedgerSetupEntity, id: number | null, request: LedgerSetupFormValues): Promise<LedgerSetupRecord> {
    const response = entity === 'settings'
      ? await apiService.put<unknown, LedgerSetupFormValues>(endpoints.settings, request)
      : entity === 'dimensionPolicies'
        ? await apiService.put<unknown, LedgerSetupFormValues>(endpoints.dimensions.policiesBase, request)
        : id
          ? await apiService.put<unknown, LedgerSetupFormValues>(itemUrl(entity, id), request)
          : await apiService.post<unknown, LedgerSetupFormValues>(baseUrl(entity), request);
    return ledgerSetupRecordSchema.parse(response);
  },

  async archive(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<void> {
    if (!item.id || !item.rowVersion) throw new Error('Missing record concurrency identity.');
    await apiService.delete(itemUrl(entity, item.id), { data: { rowVersion: item.rowVersion } });
  },

  async restore(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<LedgerSetupRecord> {
    if (!item.id || !item.rowVersion) throw new Error('Missing record concurrency identity.');
    return ledgerSetupRecordSchema.parse(await apiService.post<unknown, { rowVersion: string }>(
      endpoints.restore(baseUrl(entity), item.id),
      { rowVersion: item.rowVersion },
    ));
  },

  async resolvePreview(request: ResolveAccountPreviewRequest): Promise<ResolveAccountPreviewResponse> {
    return resolveAccountPreviewSchema.parse(await apiService.post<unknown, ResolveAccountPreviewRequest>(endpoints.resolvePreview, request));
  },
};
