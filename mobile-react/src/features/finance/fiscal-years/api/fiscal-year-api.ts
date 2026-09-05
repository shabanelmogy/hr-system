import { apiService, type PageResponse } from '@/src/core/api';
import { fiscalYearEndpoints } from './fiscal-year-endpoints';
import { fiscalYearDetailSchema, fiscalYearPageSchema } from './fiscal-year-schemas';
import type { FiscalYear, FiscalYearDetail, FiscalYearLifecycleAction, FiscalYearPageQuery, FiscalYearRequest } from '../types/fiscal-year';

export function toFiscalYearPageQuery(query: FiscalYearPageQuery) {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), searchField: query.searchField, searchOperator: query.searchOperator, recordStatus: query.recordStatus, lifecycleStatus: query.lifecycleStatus, sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.search.trim()) params.set('search', query.search.trim());
  return params.toString();
}
const normalize = (request: FiscalYearRequest): FiscalYearRequest => ({ ...request, code: request.code.trim().toUpperCase(), nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim() });
export const fiscalYearApi = {
  async getPage(query: FiscalYearPageQuery): Promise<PageResponse<FiscalYear>> { return fiscalYearPageSchema.parse(await apiService.get<unknown>(`${fiscalYearEndpoints.base}?${toFiscalYearPageQuery(query)}`)); },
  async getById(id: number): Promise<FiscalYearDetail> { return fiscalYearDetailSchema.parse(await apiService.get<unknown>(fiscalYearEndpoints.byId(id))); },
  async create(request: FiscalYearRequest): Promise<FiscalYearDetail> { return fiscalYearDetailSchema.parse(await apiService.post<unknown, FiscalYearRequest>(fiscalYearEndpoints.base, normalize(request))); },
  async update(id: number, request: FiscalYearRequest, rowVersion: string): Promise<FiscalYearDetail> { return fiscalYearDetailSchema.parse(await apiService.put<unknown, FiscalYearRequest & { rowVersion: string }>(fiscalYearEndpoints.byId(id), { ...normalize(request), rowVersion })); },
  async archive(id: number): Promise<void> { await apiService.delete<unknown>(fiscalYearEndpoints.byId(id)); },
  async restore(id: number, rowVersion: string): Promise<FiscalYearDetail> { return fiscalYearDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(fiscalYearEndpoints.restore(id), { rowVersion })); },
  async lifecycle(id: number, rowVersion: string, action: FiscalYearLifecycleAction): Promise<FiscalYearDetail> { return fiscalYearDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(fiscalYearEndpoints[action](id), { rowVersion })); },
};
