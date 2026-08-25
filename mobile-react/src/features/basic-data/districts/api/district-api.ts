import { apiService, type PageResponse } from '@/src/core/api';
import { districtEndpoints } from './district-endpoints';
import { bulkArchiveDistrictsResultSchema, bulkCreateDistrictsResultSchema, districtDetailSchema, districtLookupSchema, districtPageSchema, districtWithAddressesSchema } from './district-schemas';
import type { BulkArchiveDistrictsResponse, BulkCreateDistrictsResponse, District, DistrictDetail, DistrictLookup, DistrictPageQuery, DistrictRequest, DistrictWithAddresses } from '../types/district';

export function toDistrictPageQuery(query: DistrictPageQuery): string {
  const parameters = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status, sortBy: query.sortBy, sortDirection: query.sortDirection, searchField: query.searchField, searchOperator: query.searchOperator });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  if (query.stateId != null) parameters.set('stateId', String(query.stateId));
  if (query.hasAddresses != null) parameters.set('hasAddresses', String(query.hasAddresses));
  return parameters.toString();
}
function normalizeRequest(request: DistrictRequest): DistrictRequest { return { nameAr: request.nameAr.trim(), nameEn: request.nameEn.trim(), code: request.code.trim().toUpperCase(), stateId: Number(request.stateId) }; }
export const districtApi = {
  async getPage(query: DistrictPageQuery): Promise<PageResponse<District>> { return districtPageSchema.parse(await apiService.get<unknown>(`${districtEndpoints.base}?${toDistrictPageQuery(query)}`)); },
  async getLookup(stateId?: number): Promise<DistrictLookup[]> { return districtLookupSchema.parse(await apiService.get<unknown>(districtEndpoints.lookup(stateId))); },
  async getByState(stateId: number): Promise<DistrictLookup[]> { return districtLookupSchema.parse(await apiService.get<unknown>(districtEndpoints.byState(stateId))); },
  async getById(id: number): Promise<DistrictDetail> { return districtDetailSchema.parse(await apiService.get<unknown>(districtEndpoints.byId(id))); },
  async getWithAddresses(id: number): Promise<DistrictWithAddresses> { return districtWithAddressesSchema.parse(await apiService.get<unknown>(districtEndpoints.withAddresses(id))); },
  async create(request: DistrictRequest): Promise<DistrictDetail> { return districtDetailSchema.parse(await apiService.post<unknown, DistrictRequest>(districtEndpoints.base, normalizeRequest(request))); },
  async bulkCreate(requests: readonly DistrictRequest[]): Promise<BulkCreateDistrictsResponse> { const districts = requests.map(normalizeRequest); return bulkCreateDistrictsResultSchema.parse(await apiService.post<unknown, { districts: DistrictRequest[] }>(districtEndpoints.bulkCreate, { districts })); },
  async update(id: number, request: DistrictRequest): Promise<DistrictDetail> { return districtDetailSchema.parse(await apiService.put<unknown, DistrictRequest>(districtEndpoints.byId(id), normalizeRequest(request))); },
  async archive(id: number): Promise<void> { await apiService.delete<unknown>(districtEndpoints.byId(id)); },
  async restore(id: number): Promise<void> { await apiService.post<unknown, undefined>(districtEndpoints.restore(id), undefined); },
  async bulkArchive(ids: readonly number[]): Promise<BulkArchiveDistrictsResponse> { return bulkArchiveDistrictsResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(districtEndpoints.bulkArchive, { ids })); },
};
