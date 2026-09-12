import type {
  BulkArchiveCountriesResponse,
  BulkCreateCountriesResponse,
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryRequest,
  CountryWithStates,
} from '../models/country';

export interface CountryReadResult<T> {
  value: T;
  source: 'remote' | 'cache';
  cachedAt: string | null;
}

export interface CountryRepository {
  getPage(query: CountryPageQuery): Promise<CountryReadResult<CountryPage>>;
  getLookup(): Promise<CountryReadResult<CountryLookupItem[]>>;
  getById(id: number): Promise<CountryReadResult<CountryDetail>>;
  getWithStates(id: number): Promise<CountryReadResult<CountryWithStates>>;
  create(request: CountryRequest): Promise<CountryDetail>;
  update(id: number, request: CountryRequest): Promise<CountryDetail>;
  archive(id: number): Promise<void>;
  restore(id: number): Promise<void>;
  bulkArchive(ids: readonly number[]): Promise<BulkArchiveCountriesResponse>;
  bulkCreate(requests: readonly CountryRequest[]): Promise<BulkCreateCountriesResponse>;
}
