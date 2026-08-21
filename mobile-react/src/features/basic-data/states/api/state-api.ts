import { apiService, type PageResponse } from '@/src/core/api';
import { stateEndpoints } from './state-endpoints';
import { bulkArchiveStatesResultSchema, stateDetailSchema, stateLookupSchema, statePageSchema, stateWithDistrictsSchema } from './state-schemas';
import type { BulkArchiveStatesResponse, State, StateDetail, StateLookup, StatePageQuery, StateRequest, StateWithDistricts } from '../types/state';

export function toStatePageQuery(query: StatePageQuery): string {
  const parameters = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status, sortBy: query.sortBy, sortDirection: query.sortDirection, searchField: query.searchField, searchOperator: query.searchOperator });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  if (query.countryId != null) parameters.set('countryId', String(query.countryId));
  if (query.hasDistricts != null) parameters.set('hasDistricts', String(query.hasDistricts));
  return parameters.toString();
}
function normalizeRequest(request: StateRequest): StateRequest { return { nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim(), code: request.code.trim().toUpperCase(), countryId: Number(request.countryId) }; }
export const stateApi = {
  async getPage(query: StatePageQuery): Promise<PageResponse<State>> { return statePageSchema.parse(await apiService.get<unknown>(`${stateEndpoints.base}?${toStatePageQuery(query)}`)); },
  async getLookup(countryId?: number): Promise<StateLookup[]> { return stateLookupSchema.parse(await apiService.get<unknown>(stateEndpoints.lookup(countryId))); },
  async getByCountry(countryId: number): Promise<StateLookup[]> { return stateLookupSchema.parse(await apiService.get<unknown>(stateEndpoints.byCountry(countryId))); },
  async getById(id: number): Promise<StateDetail> { return stateDetailSchema.parse(await apiService.get<unknown>(stateEndpoints.byId(id))); },
  async getWithDistricts(id: number): Promise<StateWithDistricts> { return stateWithDistrictsSchema.parse(await apiService.get<unknown>(stateEndpoints.withDistricts(id))); },
  async create(request: StateRequest): Promise<StateDetail> { return stateDetailSchema.parse(await apiService.post<unknown, StateRequest>(stateEndpoints.base, normalizeRequest(request))); },
  async update(id: number, request: StateRequest): Promise<StateDetail> { return stateDetailSchema.parse(await apiService.put<unknown, StateRequest>(stateEndpoints.byId(id), normalizeRequest(request))); },
  async archive(id: number): Promise<void> { await apiService.delete<unknown>(stateEndpoints.byId(id)); },
  async restore(id: number): Promise<void> { await apiService.post<unknown, undefined>(stateEndpoints.restore(id), undefined); },
  async bulkArchive(ids: readonly number[]): Promise<BulkArchiveStatesResponse> { return bulkArchiveStatesResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(stateEndpoints.bulkArchive, { ids })); },
};
