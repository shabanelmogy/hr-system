import { ApiError, apiService } from '@/src/core/api';
import type {
  BulkArchiveCountriesResponse,
  BulkCreateCountriesResponse,
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryRequest,
  CountryWithStates,
} from '../../domain/models/country';
import { countryEndpoints } from './country-endpoints';
import {
  bulkArchiveResultSchema,
  bulkCreateResultSchema,
  countryDetailSchema,
  countryLookupSchema,
  countryPageSchema,
  countryWithStatesSchema,
} from './country-schemas';

export interface CountryRemoteDataSource {
  getPage(query: CountryPageQuery): Promise<CountryPage>;
  getLookup(): Promise<CountryLookupItem[]>;
  getById(id: number): Promise<CountryDetail>;
  getWithStates(id: number): Promise<CountryWithStates>;
  create(request: CountryRequest): Promise<CountryDetail>;
  update(id: number, request: CountryRequest): Promise<CountryDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveCountriesResponse>;
  bulkCreate(requests: readonly CountryRequest[]): Promise<BulkCreateCountriesResponse>;
}

export function isCountryOfflineReadError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}

export function toCountryPageQuery(query: CountryPageQuery): string {
  const parameters = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    status: query.status,
    searchField: query.searchField,
    searchOperator: query.searchOperator,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  return parameters.toString();
}

export const countryRemoteDataSource: CountryRemoteDataSource = {
  async getPage(query) {
    return countryPageSchema.parse(await apiService.get<unknown>(
      `${countryEndpoints.base}?${toCountryPageQuery(query)}`,
    ));
  },
  async getLookup() {
    return countryLookupSchema.parse(await apiService.get<unknown>(countryEndpoints.lookup));
  },
  async getById(id) {
    return countryDetailSchema.parse(await apiService.get<unknown>(countryEndpoints.byId(id)));
  },
  async getWithStates(id) {
    return countryWithStatesSchema.parse(await apiService.get<unknown>(countryEndpoints.withStates(id)));
  },
  async create(request) {
    return countryDetailSchema.parse(await apiService.post<unknown, CountryRequest>(
      countryEndpoints.base,
      request,
    ));
  },
  async update(id, request) {
    return countryDetailSchema.parse(await apiService.put<unknown, CountryRequest>(
      countryEndpoints.byId(id),
      request,
    ));
  },
  async archive(id) {
    await apiService.delete<unknown>(countryEndpoints.byId(id));
  },
  async restore(id) {
    await apiService.post<unknown, undefined>(countryEndpoints.restore(id), undefined);
  },
  async bulkArchive(ids) {
    return bulkArchiveResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(
      countryEndpoints.bulkArchive,
      { ids },
    ));
  },
  async bulkCreate(requests) {
    return bulkCreateResultSchema.parse(await apiService.post<unknown, { countries: readonly CountryRequest[] }>(
      countryEndpoints.bulkCreate,
      { countries: requests },
    ));
  },
};
