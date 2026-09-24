import { apiService } from '@/src/core/api';
import type {
  FiscalYearDetail,
  FiscalYearLifecycleAction,
  FiscalYearLookup,
  FiscalYearPage,
  FiscalYearPageQuery,
  FiscalYearRequest,
} from '../../domain/models/fiscal-year';
import { fiscalYearEndpoints } from './fiscal-year-endpoints';
import { fiscalYearDetailSchema, fiscalYearLookupSchema, fiscalYearPageSchema } from './fiscal-year-schemas';

export interface FiscalYearRemoteDataSource {
  getPage(query: FiscalYearPageQuery): Promise<FiscalYearPage>;
  getById(id: number): Promise<FiscalYearDetail>;
  getLookup(): Promise<FiscalYearLookup[]>;
  create(request: FiscalYearRequest): Promise<FiscalYearDetail>;
  update(id: number, request: FiscalYearRequest, rowVersion: string): Promise<FiscalYearDetail>;
  archive(id: number, rowVersion: string): Promise<void>;
  restore(id: number, rowVersion: string): Promise<FiscalYearDetail>;
  lifecycle(id: number, rowVersion: string, action: FiscalYearLifecycleAction): Promise<FiscalYearDetail>;
}

export function toFiscalYearPageQuery(query: FiscalYearPageQuery): string {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), searchField: query.searchField, searchOperator: query.searchOperator, recordStatus: query.recordStatus, lifecycleStatus: query.lifecycleStatus, sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.search.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const fiscalYearRemoteDataSource: FiscalYearRemoteDataSource = {
  async getPage(query) { return fiscalYearPageSchema.parse(await apiService.get<unknown>(`${fiscalYearEndpoints.base}?${toFiscalYearPageQuery(query)}`)); },
  async getById(id) { return fiscalYearDetailSchema.parse(await apiService.get<unknown>(fiscalYearEndpoints.byId(id))); },
  async getLookup() { return fiscalYearLookupSchema.parse(await apiService.get<unknown>(fiscalYearEndpoints.lookup)); },
  async create(request) { return fiscalYearDetailSchema.parse(await apiService.post<unknown, FiscalYearRequest>(fiscalYearEndpoints.base, request)); },
  async update(id, request, rowVersion) { return fiscalYearDetailSchema.parse(await apiService.put<unknown, FiscalYearRequest & { rowVersion: string }>(fiscalYearEndpoints.byId(id), { ...request, rowVersion })); },
  async archive(id, rowVersion) { await apiService.delete<unknown>(fiscalYearEndpoints.byId(id), { data: { rowVersion } }); },
  async restore(id, rowVersion) { return fiscalYearDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(fiscalYearEndpoints.restore(id), { rowVersion })); },
  async lifecycle(id, rowVersion, action) { return fiscalYearDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(fiscalYearEndpoints[action](id), { rowVersion })); },
};
