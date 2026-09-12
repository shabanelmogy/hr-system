import { apiService } from '@/src/core/api';
import type {
  BulkArchiveStatesResponse,
  BulkCreateStatesResponse,
  StateDetail,
  StateLookup,
  StatePage,
  StatePageQuery,
  StateRequest,
  StateWithDistricts,
} from '../../domain/models/state';
import { stateEndpoints } from './state-endpoints';
import {
  bulkArchiveStatesResultSchema,
  bulkCreateStatesResultSchema,
  stateDetailSchema,
  stateLookupSchema,
  statePageSchema,
  stateWithDistrictsSchema,
} from './state-schemas';

export interface StateRemoteDataSource {
  getPage(query: StatePageQuery): Promise<StatePage>;
  getLookup(countryId?: number): Promise<StateLookup[]>;
  getByCountry(countryId: number): Promise<StateLookup[]>;
  getById(id: number): Promise<StateDetail>;
  getWithDistricts(id: number): Promise<StateWithDistricts>;
  create(request: StateRequest): Promise<StateDetail>;
  update(id: number, request: StateRequest): Promise<StateDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveStatesResponse>;
  bulkCreate(requests: readonly StateRequest[]): Promise<BulkCreateStatesResponse>;
}

export function toStatePageQuery(query: StatePageQuery): string {
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
  if (query.countryId != null) parameters.set('countryId', String(query.countryId));
  if (query.hasDistricts != null) parameters.set('hasDistricts', String(query.hasDistricts));
  return parameters.toString();
}

export const stateRemoteDataSource: StateRemoteDataSource = {
  async getPage(query) {
    return statePageSchema.parse(await apiService.get<unknown>(
      `${stateEndpoints.base}?${toStatePageQuery(query)}`,
    ));
  },
  async getLookup(countryId) {
    return stateLookupSchema.parse(await apiService.get<unknown>(stateEndpoints.lookup(countryId)));
  },
  async getByCountry(countryId) {
    return stateLookupSchema.parse(await apiService.get<unknown>(stateEndpoints.byCountry(countryId)));
  },
  async getById(id) {
    return stateDetailSchema.parse(await apiService.get<unknown>(stateEndpoints.byId(id)));
  },
  async getWithDistricts(id) {
    return stateWithDistrictsSchema.parse(await apiService.get<unknown>(stateEndpoints.withDistricts(id)));
  },
  async create(request) {
    return stateDetailSchema.parse(await apiService.post<unknown, StateRequest>(stateEndpoints.base, request));
  },
  async update(id, request) {
    return stateDetailSchema.parse(await apiService.put<unknown, StateRequest>(stateEndpoints.byId(id), request));
  },
  async archive(id) {
    await apiService.delete<unknown>(stateEndpoints.byId(id));
  },
  async restore(id) {
    await apiService.post<unknown, undefined>(stateEndpoints.restore(id), undefined);
  },
  async bulkArchive(ids) {
    return bulkArchiveStatesResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(
      stateEndpoints.bulkArchive,
      { ids },
    ));
  },
  async bulkCreate(requests) {
    return bulkCreateStatesResultSchema.parse(await apiService.post<unknown, { states: readonly StateRequest[] }>(
      stateEndpoints.bulkCreate,
      { states: requests },
    ));
  },
};
