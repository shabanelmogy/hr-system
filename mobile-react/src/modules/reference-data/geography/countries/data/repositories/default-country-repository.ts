import type {
  CountryDetail,
  CountryLookupItem,
  CountryPage,
  CountryPageQuery,
  CountryWithStates,
} from '../../domain/models/country';
import type { CountryReadResult, CountryRepository } from '../../domain/repositories/country-repository';
import type { CountryCachedValue, CountryLocalDataSource } from '../local/country-local-data-source';
import type { CountryRemoteDataSource } from '../remote/country-remote-data-source';

export interface CountryOfflineReadOptions {
  enabled: () => boolean;
  isFresh: (cachedAt: string) => boolean;
  now?: () => string;
}

const disabledOfflineRead: CountryOfflineReadOptions = {
  enabled: () => false,
  isFresh: () => false,
};

async function bestEffort(operation: () => Promise<void>): Promise<void> {
  try {
    await operation();
  } catch {
    // A cache failure must never turn a successful authoritative server operation into a failure.
  }
}

async function readRemoteFirst<T>(
  remoteRead: () => Promise<T>,
  localRead: () => Promise<CountryCachedValue<T> | null>,
  localWrite: (value: T) => Promise<void>,
  canFallbackToLocal: (error: unknown) => boolean,
  isOnline: () => boolean,
  offlineRead: CountryOfflineReadOptions,
): Promise<CountryReadResult<T>> {
  const readLocal = async (): Promise<CountryReadResult<T> | null> => {
    if (!offlineRead.enabled()) return null;
    const localValue = await localRead();
    if (localValue === null) return null;
    if (!offlineRead.isFresh(localValue.cachedAt)) {
      throw new Error('Cached Countries data is older than the allowed offline-read window.');
    }
    return { value: localValue.value, source: 'cache', cachedAt: localValue.cachedAt };
  };

  if (!isOnline()) {
    if (!offlineRead.enabled()) {
      throw new Error('Countries requires an internet connection because cached reads are disabled.');
    }
    const localValue = await readLocal();
    if (localValue !== null) return localValue;
    throw new Error('No cached Countries data is available while offline.');
  }

  try {
    const remoteValue = await remoteRead();
    if (offlineRead.enabled()) {
      await bestEffort(() => localWrite(remoteValue));
    }
    return {
      value: remoteValue,
      source: 'remote',
      cachedAt: offlineRead.now?.() ?? new Date().toISOString(),
    };
  } catch (error) {
    if (!canFallbackToLocal(error) || !offlineRead.enabled()) throw error;
    try {
      const localValue = await localRead();
      if (localValue !== null) {
        if (!offlineRead.isFresh(localValue.cachedAt)) {
          throw new Error('Cached Countries data is older than the allowed offline-read window.');
        }
        return { value: localValue.value, source: 'cache', cachedAt: localValue.cachedAt };
      }
    } catch {
      // Preserve the authoritative transport error when the local fallback is unavailable.
    }
    throw error;
  }
}

export class DefaultCountryRepository implements CountryRepository {
  constructor(
    private readonly remote: CountryRemoteDataSource,
    private readonly local: CountryLocalDataSource,
    private readonly canFallbackToLocal: (error: unknown) => boolean,
    private readonly isOnline: () => boolean = () => true,
    private readonly offlineRead: CountryOfflineReadOptions = disabledOfflineRead,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) {
      throw new Error('This Countries action requires an internet connection.');
    }
  }

  getPage(query: CountryPageQuery): Promise<CountryReadResult<CountryPage>> {
    return readRemoteFirst(
      () => this.remote.getPage(query),
      () => this.local.getPage(query),
      (page) => this.local.putPage(query, page),
      this.canFallbackToLocal,
      this.isOnline,
      this.offlineRead,
    );
  }

  getLookup(): Promise<CountryReadResult<CountryLookupItem[]>> {
    return readRemoteFirst(
      () => this.remote.getLookup(),
      () => this.local.getLookup(),
      (items) => this.local.putLookup(items),
      this.canFallbackToLocal,
      this.isOnline,
      this.offlineRead,
    );
  }

  getById(id: number): Promise<CountryReadResult<CountryDetail>> {
    return readRemoteFirst(
      () => this.remote.getById(id),
      () => this.local.getById(id),
      (country) => this.local.putById(country),
      this.canFallbackToLocal,
      this.isOnline,
      this.offlineRead,
    );
  }

  getWithStates(id: number): Promise<CountryReadResult<CountryWithStates>> {
    return readRemoteFirst(
      () => this.remote.getWithStates(id),
      () => this.local.getWithStates(id),
      (country) => this.local.putWithStates(country),
      this.canFallbackToLocal,
      this.isOnline,
      this.offlineRead,
    );
  }

  async create(request: Parameters<CountryRepository['create']>[0]) {
    this.requireOnline();
    const result = await this.remote.create(request);
    await bestEffort(() => this.local.invalidateReads());
    return result;
  }

  async update(id: number, request: Parameters<CountryRepository['update']>[1]) {
    this.requireOnline();
    const result = await this.remote.update(id, request);
    await bestEffort(() => this.local.invalidateReads());
    return result;
  }

  async archive(id: number) {
    this.requireOnline();
    await this.remote.archive(id);
    await bestEffort(() => this.local.invalidateReads());
  }

  async restore(id: number) {
    this.requireOnline();
    await this.remote.restore(id);
    await bestEffort(() => this.local.invalidateReads());
  }

  async bulkArchive(ids: readonly number[]) {
    this.requireOnline();
    const result = await this.remote.bulkArchive(ids);
    await bestEffort(() => this.local.invalidateReads());
    return result;
  }

  async bulkCreate(requests: Parameters<CountryRepository['bulkCreate']>[0]) {
    this.requireOnline();
    const result = await this.remote.bulkCreate(requests);
    await bestEffort(() => this.local.invalidateReads());
    return result;
  }
}
