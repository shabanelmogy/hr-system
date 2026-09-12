import type { SQLiteDatabase } from 'expo-sqlite';

import {
  normalizeOfflineScope,
  ScopedRecordStore,
  type OfflineScope,
} from '@/src/core/offline';

import type {
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryWithStates,
} from '../../domain/models/country';
import type { CountryCachedValue, CountryLocalDataSource } from './country-local-data-source';

const namespaces = {
  page: 'countries.page',
  lookup: 'countries.lookup',
  detail: 'countries.detail',
  withStates: 'countries.with-states',
} as const;

export class SqliteCountryLocalDataSource implements CountryLocalDataSource {
  private readonly records: ScopedRecordStore;
  private readonly scope: OfflineScope;

  constructor(
    private readonly db: SQLiteDatabase,
    scope: OfflineScope,
  ) {
    this.records = new ScopedRecordStore(db);
    this.scope = normalizeOfflineScope(scope);
  }

  async getPage(query: CountryPageQuery): Promise<CountryCachedValue<CountryPage> | null> {
    const record = await this.records.get<CountryPage>(
      this.scope,
      namespaces.page,
      pageKey(query),
    );
    return record ? { value: record.value, cachedAt: record.localUpdatedAt } : null;
  }

  async putPage(query: CountryPageQuery, page: CountryPage): Promise<void> {
    await this.records.put({
      scope: this.scope,
      namespace: namespaces.page,
      key: pageKey(query),
      value: page,
    });
  }

  async getLookup(): Promise<CountryCachedValue<CountryLookupItem[]> | null> {
    const record = await this.records.get<CountryLookupItem[]>(
      this.scope,
      namespaces.lookup,
      'all',
    );
    return record ? { value: record.value, cachedAt: record.localUpdatedAt } : null;
  }

  async putLookup(items: readonly CountryLookupItem[]): Promise<void> {
    await this.records.put({
      scope: this.scope,
      namespace: namespaces.lookup,
      key: 'all',
      value: [...items],
    });
  }

  async getById(id: number): Promise<CountryCachedValue<CountryDetail> | null> {
    const record = await this.records.get<CountryDetail>(
      this.scope,
      namespaces.detail,
      String(id),
    );
    return record ? { value: record.value, cachedAt: record.localUpdatedAt } : null;
  }

  async putById(country: CountryDetail): Promise<void> {
    await this.records.put({
      scope: this.scope,
      namespace: namespaces.detail,
      key: String(country.id),
      value: country,
      serverUpdatedAt: country.updatedOn ?? country.createdOn,
    });
  }

  async getWithStates(id: number): Promise<CountryCachedValue<CountryWithStates> | null> {
    const record = await this.records.get<CountryWithStates>(
      this.scope,
      namespaces.withStates,
      String(id),
    );
    return record ? { value: record.value, cachedAt: record.localUpdatedAt } : null;
  }

  async putWithStates(country: CountryWithStates): Promise<void> {
    await this.records.put({
      scope: this.scope,
      namespace: namespaces.withStates,
      key: String(country.id),
      value: country,
      serverUpdatedAt: country.updatedOn ?? country.createdOn,
    });
  }

  async invalidateReads(): Promise<void> {
    await this.db.runAsync(
      `DELETE FROM offline_records
       WHERE user_id = ? AND tenant_id = ? AND company_id = ?
         AND namespace LIKE 'countries.%'`,
      this.scope.userId,
      this.scope.tenantId,
      this.scope.companyId,
    );
  }
}

function pageKey(query: CountryPageQuery): string {
  return JSON.stringify([
    query.pageNumber,
    query.pageSize,
    query.search.trim(),
    query.searchField,
    query.searchOperator,
    query.status,
    query.sortBy,
    query.sortDirection,
  ]);
}
