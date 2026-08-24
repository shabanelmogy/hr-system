import { apiService, type PageResponse } from '@/src/core/api';
import { countryEndpoints } from './country-endpoints';
import {
  bulkArchiveResultSchema,
  countryDetailSchema,
  countryLookupSchema,
  countryPageSchema,
  countryWithStatesSchema,
} from './country-schemas';
import type {
  BulkArchiveCountriesResponse,
  Country,
  CountryDetail,
  CountryPageQuery,
  CountryRequest,
  CountryWithStates,
} from '../types/country';

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

export const countryApi = {
  async getPage(query: CountryPageQuery): Promise<PageResponse<Country>> {
    return countryPageSchema.parse(await apiService.get<unknown>(
      `${countryEndpoints.base}?${toCountryPageQuery(query)}`,
    ));
  },
  async getLookup() {
    return countryLookupSchema.parse(await apiService.get<unknown>(countryEndpoints.lookup));
  },
  async getById(id: number): Promise<CountryDetail> {
    return countryDetailSchema.parse(await apiService.get<unknown>(countryEndpoints.byId(id)));
  },
  async getWithStates(id: number): Promise<CountryWithStates> {
    return countryWithStatesSchema.parse(await apiService.get<unknown>(countryEndpoints.withStates(id)));
  },
  async create(request: CountryRequest): Promise<CountryDetail> {
    return countryDetailSchema.parse(await apiService.post<unknown, CountryRequest>(
      countryEndpoints.base,
      request,
    ));
  },
  async update(id: number, request: CountryRequest): Promise<CountryDetail> {
    return countryDetailSchema.parse(await apiService.put<unknown, CountryRequest>(
      countryEndpoints.byId(id),
      request,
    ));
  },
  async archive(id: number): Promise<void> {
    await apiService.delete<unknown>(countryEndpoints.byId(id));
  },
  async restore(id: number): Promise<void> {
    await apiService.post<unknown, undefined>(countryEndpoints.restore(id), undefined);
  },
  async bulkArchive(ids: readonly number[]): Promise<BulkArchiveCountriesResponse> {
    return bulkArchiveResultSchema.parse(await apiService.post<unknown, { ids: readonly number[] }>(
      countryEndpoints.bulkArchive,
      { ids },
    ));
  },
};
