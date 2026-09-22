import { apiService } from '@/src/core/api';
import type { Currency, CurrencyLookup, CurrencyPage, CurrencyPageQuery, CurrencyRequest } from '../../domain/models/currency';
import { currencyEndpoints } from './currency-endpoints';
import { currencyLookupSchema, currencyPageSchema, currencySchema } from './currency-schemas';

export interface CurrencyRemoteDataSource {
  getPage(query: CurrencyPageQuery): Promise<CurrencyPage>;
  getById(id: number): Promise<Currency>;
  getLookup(): Promise<CurrencyLookup[]>;
  create(request: CurrencyRequest): Promise<Currency>;
  update(id: number, request: CurrencyRequest, rowVersion: string): Promise<Currency>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<Currency>;
}

export function toCurrencyPageQuery(query: CurrencyPageQuery): string {
  const params = new URLSearchParams({
    pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), searchField: query.searchField,
    searchOperator: query.searchOperator, recordStatus: query.recordStatus, sortBy: query.sortBy, sortDirection: query.sortDirection,
  });
  if (query.search.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const currencyRemoteDataSource: CurrencyRemoteDataSource = {
  async getPage(query) { return currencyPageSchema.parse(await apiService.get<unknown>(`${currencyEndpoints.base}?${toCurrencyPageQuery(query)}`)); },
  async getById(id) { return currencySchema.parse(await apiService.get<unknown>(currencyEndpoints.byId(id))); },
  async getLookup() { return currencyLookupSchema.parse(await apiService.get<unknown>(currencyEndpoints.lookup)); },
  async create(request) { return currencySchema.parse(await apiService.post<unknown, CurrencyRequest>(currencyEndpoints.base, request)); },
  async update(id, request, rowVersion) { return currencySchema.parse(await apiService.put<unknown, CurrencyRequest & { rowVersion: string }>(currencyEndpoints.byId(id), { ...request, rowVersion })); },
  async archive(id, rowVersion) { await apiService.delete<unknown>(currencyEndpoints.byId(id), { data: { rowVersion } }); },
  async restore(id, rowVersion) { return currencySchema.parse(await apiService.post<unknown, { rowVersion: string }>(currencyEndpoints.restore(id), { rowVersion })); },
};
