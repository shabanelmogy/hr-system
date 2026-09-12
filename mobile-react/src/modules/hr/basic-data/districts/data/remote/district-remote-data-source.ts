import { apiService, type PageResponse } from '@/src/core/api';

import type {
  BulkArchiveDistrictsResponse,
  BulkCreateDistrictsResponse,
  District,
  DistrictDetail,
  DistrictLookup,
  DistrictPageQuery,
  DistrictRequest,
  DistrictWithAddresses,
} from '../../domain/models/district';
import { districtEndpoints } from './district-endpoints';
import {
  bulkArchiveDistrictsResultSchema,
  bulkCreateDistrictsResultSchema,
  districtDetailSchema,
  districtLookupSchema,
  districtPageSchema,
  districtWithAddressesSchema,
} from './district-schemas';

export interface DistrictRemoteDataSource {
  getPage(query: DistrictPageQuery): Promise<PageResponse<District>>;
  getLookup(stateId?: number): Promise<DistrictLookup[]>;
  getByState(stateId: number): Promise<DistrictLookup[]>;
  getById(id: number): Promise<DistrictDetail>;
  getWithAddresses(id: number): Promise<DistrictWithAddresses>;
  create(request: DistrictRequest): Promise<DistrictDetail>;
  update(id: number, request: DistrictRequest): Promise<DistrictDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveDistrictsResponse>;
  bulkCreate(requests: readonly DistrictRequest[]): Promise<BulkCreateDistrictsResponse>;
}

export function toDistrictPageQuery(query: DistrictPageQuery): string {
  const parameters = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
    searchField: query.searchField,
    searchOperator: query.searchOperator,
  });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  if (query.stateId != null) parameters.set('stateId', String(query.stateId));
  if (query.hasAddresses != null) parameters.set('hasAddresses', String(query.hasAddresses));
  return parameters.toString();
}

export const districtRemoteDataSource: DistrictRemoteDataSource = {
  async getPage(query) {
    return districtPageSchema.parse(await apiService.get<unknown>(
      `${districtEndpoints.base}?${toDistrictPageQuery(query)}`,
    ));
  },
  async getLookup(stateId) {
    return districtLookupSchema.parse(await apiService.get<unknown>(districtEndpoints.lookup(stateId)));
  },
  async getByState(stateId) {
    return districtLookupSchema.parse(await apiService.get<unknown>(districtEndpoints.byState(stateId)));
  },
  async getById(id) {
    return districtDetailSchema.parse(await apiService.get<unknown>(districtEndpoints.byId(id)));
  },
  async getWithAddresses(id) {
    return districtWithAddressesSchema.parse(await apiService.get<unknown>(districtEndpoints.withAddresses(id)));
  },
  async create(request) {
    return districtDetailSchema.parse(await apiService.post<unknown, DistrictRequest>(districtEndpoints.base, request));
  },
  async update(id, request) {
    return districtDetailSchema.parse(await apiService.put<unknown, DistrictRequest>(districtEndpoints.byId(id), request));
  },
  async archive(id) {
    await apiService.delete<unknown>(districtEndpoints.byId(id));
  },
  async restore(id) {
    await apiService.post<unknown, undefined>(districtEndpoints.restore(id), undefined);
  },
  async bulkArchive(ids) {
    return bulkArchiveDistrictsResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(
      districtEndpoints.bulkArchive,
      { ids },
    ));
  },
  async bulkCreate(requests) {
    return bulkCreateDistrictsResultSchema.parse(await apiService.post<unknown, { districts: readonly DistrictRequest[] }>(
      districtEndpoints.bulkCreate,
      { districts: requests },
    ));
  },
};
