import type {
  BulkArchiveCountriesResponse,
  BulkCreateCountriesResponse,
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryRequest,
  CountryWithStates,
} from '../domain/models/country';
import {
  normalizeCountryRequest,
  normalizeCountryRequests,
} from '../domain/policies/country-request-policy';
import type { CountryReadResult, CountryRepository } from '../domain/repositories/country-repository';

export interface SaveCountryInput {
  id: number | null;
  request: CountryRequest;
}

export interface CountryUseCases {
  getPage(query: CountryPageQuery): Promise<CountryReadResult<CountryPage>>;
  getLookup(): Promise<CountryReadResult<CountryLookupItem[]>>;
  getById(id: number): Promise<CountryReadResult<CountryDetail>>;
  getWithStates(id: number): Promise<CountryReadResult<CountryWithStates>>;
  create(request: CountryRequest): Promise<CountryDetail>;
  update(id: number, request: CountryRequest): Promise<CountryDetail>;
  save(input: SaveCountryInput): Promise<CountryDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveCountriesResponse>;
  bulkCreate(requests: readonly CountryRequest[]): Promise<BulkCreateCountriesResponse>;
}

export function createCountryUseCases(repository: CountryRepository): CountryUseCases {
  const create = (request: CountryRequest) => repository.create(normalizeCountryRequest(request));
  const update = (id: number, request: CountryRequest) =>
    repository.update(id, normalizeCountryRequest(request));

  return {
    getPage: (query) => repository.getPage(query),
    getLookup: () => repository.getLookup(),
    getById: (id) => repository.getById(id),
    getWithStates: (id) => repository.getWithStates(id),
    create,
    update,
    save: ({ id, request }) => id === null ? create(request) : update(id, request),
    archive: (id) => repository.archive(id),
    restore: (id) => repository.restore(id),
    bulkArchive: (ids) => repository.bulkArchive(ids),
    bulkCreate: (requests) => repository.bulkCreate(normalizeCountryRequests(requests)),
  };
}
