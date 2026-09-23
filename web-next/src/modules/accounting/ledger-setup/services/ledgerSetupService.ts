import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import { ApiClientError } from "@/lib/api/client";
import type { LedgerSetupEntity, LedgerSetupLookupSource, LedgerSetupRecord, ResolveAccountPreviewRequest, ResolveAccountPreviewResponse } from "../types";

const routes = apiRoutes.ledgerSetup;
const lookupParameters = { recordStatus: "active", pageNumber: 1, pageSize: 500 };

async function dimensionOptions(): Promise<LedgerSetupRecord[]> {
  const items: LedgerSetupRecord[] = [];
  for (let pageNumber = 1; ; pageNumber++) {
    const page = await apiService.get<LedgerSetupRecord[]>(routes.dimensions.base, { ...lookupParameters, pageNumber });
    items.push(...page);
    if (page.length < lookupParameters.pageSize) return items;
  }
}

function entityBase(entity: LedgerSetupEntity): string {
  switch (entity) {
    case "accounts": return routes.accounts.base;
    case "hierarchyLevels": return routes.accounts.hierarchyLevels;
    case "dimensionDefinitions": return routes.dimensions.base;
    case "dimensionValues": return `${routes.dimensions.base}/values`;
    case "dimensionPolicies": return `${routes.dimensions.base}/policies`;
    case "books": return routes.books.base;
    case "journals": return routes.journals.base;
    case "exchangeRateTypes": return routes.exchangeRateTypes.base;
    case "exchangeRates": return routes.exchangeRates.base;
    case "accountMappings": return routes.mappings.base;
    case "postingProfiles": return routes.postingProfiles.base;
    case "settings": return routes.settings.get;
  }
}

function entityItem(entity: LedgerSetupEntity, id: number): string {
  if (entity === "accounts") return routes.accounts.update(id);
  if (entity === "hierarchyLevels") return `${routes.accounts.hierarchyLevels}/${id}`;
  if (entity === "dimensionDefinitions") return routes.dimensions.update(id);
  if (entity === "dimensionValues") return routes.dimensions.valuesUpdate(id);
  if (entity === "books") return routes.books.byId(id);
  if (entity === "journals") return routes.journals.byId(id);
  if (entity === "exchangeRateTypes") return routes.exchangeRateTypes.byId(id);
  if (entity === "exchangeRates") return routes.exchangeRates.byId(id);
  if (entity === "accountMappings") return routes.mappings.byId(id);
  if (entity === "postingProfiles") return routes.postingProfiles.byId(id);
  return entityBase(entity);
}

function restoreUrl(entity: LedgerSetupEntity, id: number): string {
  if (entity === "accounts") return routes.accounts.restore(id);
  if (entity === "hierarchyLevels") return `${routes.accounts.hierarchyLevels}/${id}/restore`;
  if (entity === "dimensionDefinitions") return routes.dimensions.restore(id);
  if (entity === "dimensionValues") return routes.dimensions.valuesRestore(id);
  if (entity === "books") return routes.books.restore(id);
  if (entity === "journals") return routes.journals.restore(id);
  if (entity === "exchangeRateTypes") return routes.exchangeRateTypes.restore(id);
  return entityItem(entity, id);
}

export const ledgerSetupService = {
  async list(entity: LedgerSetupEntity, scopeId?: number, pageNumber = 1, pageSize = 50, search?: string): Promise<LedgerSetupRecord[]> {
    if (entity === "settings") {
      try {
        return [await apiService.get<LedgerSetupRecord>(routes.settings.get)];
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) return [];
        throw error;
      }
    }
    const parameters = { recordStatus: "all", pageNumber, pageSize, ...(search && (entity === "accounts" || entity === "dimensionDefinitions") ? { search } : {}) };
    if (entity === "dimensionValues") return scopeId ? apiService.get(routes.dimensions.values(scopeId), parameters) : [];
    if (entity === "dimensionPolicies") return scopeId ? apiService.get(routes.dimensions.policies(scopeId)) : [];
    return apiService.get(entityBase(entity), parameters);
  },
  account(id: number): Promise<LedgerSetupRecord> { return apiService.get(routes.accounts.update(id)); },
  tree(): Promise<LedgerSetupRecord[]> { return apiService.get(routes.accounts.tree); },
  accountLookup(): Promise<LedgerSetupRecord[]> { return apiService.get(routes.accounts.lookup); },
  async lookups(sources: readonly LedgerSetupLookupSource[] = ["accounts", "books", "currencies", "dimensions", "exchangeRateTypes", "hierarchyLevels"]): Promise<Record<string, LedgerSetupRecord[]>> {
    const requests: Partial<Record<LedgerSetupLookupSource, Promise<LedgerSetupRecord[]>>> = {};
    for (const source of sources) {
      requests[source] = source === "accounts"
        ? apiService.get(routes.accounts.lookup)
        : source === "books"
          ? apiService.get(routes.books.base, { recordStatus: "active" })
          : source === "currencies"
            ? apiService.get(apiRoutes.currencies.lookup)
            : source === "dimensions"
              ? dimensionOptions()
              : source === "exchangeRateTypes"
                ? apiService.get(routes.exchangeRateTypes.base, { recordStatus: "active" })
                : apiService.get(routes.accounts.hierarchyLevels, { recordStatus: "active" });
    }
    const values = await Promise.all(Object.entries(requests).map(async ([source, request]) => [source, await request!] as const));
    return Object.fromEntries(values);
  },
  async save(entity: LedgerSetupEntity, id: number | null, value: LedgerSetupRecord): Promise<LedgerSetupRecord> {
    if (entity === "settings") return apiService.put(routes.settings.save, value);
    if (entity === "dimensionPolicies") return apiService.put(`${routes.dimensions.base}/policies`, value);
    const url = id ? entityItem(entity, id) : entityBase(entity);
    return id ? apiService.put(url, value) : apiService.post(url, value);
  },
  async archive(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<void> {
    if (!item.id || !item.rowVersion) throw new Error("Missing record concurrency identity.");
    await apiService.delete(entityItem(entity, item.id), { rowVersion: item.rowVersion });
  },
  restore(entity: LedgerSetupEntity, item: LedgerSetupRecord): Promise<LedgerSetupRecord> {
    if (!item.id || !item.rowVersion) return Promise.reject(new Error("Missing record concurrency identity."));
    return apiService.post(restoreUrl(entity, item.id), { rowVersion: item.rowVersion });
  },
  resolvePreview(request: ResolveAccountPreviewRequest): Promise<ResolveAccountPreviewResponse> {
    return apiService.post(routes.postingProfiles.resolvePreview, request);
  },
};
