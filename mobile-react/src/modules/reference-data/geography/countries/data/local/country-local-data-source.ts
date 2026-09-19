import type {
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryWithStates,
} from '../../domain/models/country';

export interface CountryCachedValue<T> {
  value: T;
  cachedAt: string;
}

/**
 * Feature-owned cache boundary for the upcoming offline core.
 *
 * The default implementation intentionally stores nothing. A SQLite-backed
 * adapter can be provided later without changing domain/application code.
 */
export interface CountryLocalDataSource {
  getPage(query: CountryPageQuery): Promise<CountryCachedValue<CountryPage> | null>;
  putPage(query: CountryPageQuery, page: CountryPage): Promise<void>;
  getLookup(): Promise<CountryCachedValue<CountryLookupItem[]> | null>;
  putLookup(items: readonly CountryLookupItem[]): Promise<void>;
  getById(id: number): Promise<CountryCachedValue<CountryDetail> | null>;
  putById(country: CountryDetail): Promise<void>;
  getWithStates(id: number): Promise<CountryCachedValue<CountryWithStates> | null>;
  putWithStates(country: CountryWithStates): Promise<void>;
  invalidateReads(): Promise<void>;
}

export const unavailableCountryLocalDataSource: CountryLocalDataSource = {
  async getPage() { return null; },
  async putPage() {},
  async getLookup() { return null; },
  async putLookup() {},
  async getById() { return null; },
  async putById() {},
  async getWithStates() { return null; },
  async putWithStates() {},
  async invalidateReads() {},
};
