import type { SQLiteDatabase } from 'expo-sqlite';

import { ScopedRecordStore, type OfflineScope } from '@/src/core/offline';
import type { ErpModule } from '../../domain/models/module';
import type { ModuleCatalogCache } from './default-module-repository';

const NAMESPACE = 'platform.module-catalog';
const TTL_MS = 24 * 60 * 60 * 1_000;

interface CacheValue {
  version: 1;
  capturedAt: string;
  validUntil: string;
  modules: ErpModule[];
}

export class ScopedModuleCatalogCache implements ModuleCatalogCache {
  constructor(
    private readonly database: SQLiteDatabase,
    private readonly scope: OfflineScope,
    private readonly authorityValidUntil: string,
    private readonly now: () => number = Date.now,
  ) {}

  async read(key: string): Promise<ErpModule[] | null> {
    const record = await new ScopedRecordStore(this.database).get<CacheValue>(this.scope, NAMESPACE, key);
    const value = record?.value;
    const effectiveValidUntil = Math.min(
      Date.parse(value?.validUntil ?? ''),
      Date.parse(this.authorityValidUntil),
    );
    if (!value || value.version !== 1 || !Number.isFinite(effectiveValidUntil)
      || effectiveValidUntil <= this.now() || !Array.isArray(value.modules)) return null;
    return value.modules;
  }

  async write(key: string, modules: ErpModule[]): Promise<void> {
    const capturedAt = this.now();
    const authorityExpiry = Date.parse(this.authorityValidUntil);
    if (!Number.isFinite(authorityExpiry) || authorityExpiry <= capturedAt) return;
    await new ScopedRecordStore(this.database).put({
      scope: this.scope,
      namespace: NAMESPACE,
      key,
      value: {
        version: 1,
        capturedAt: new Date(capturedAt).toISOString(),
        validUntil: new Date(Math.min(capturedAt + TTL_MS, authorityExpiry)).toISOString(),
        modules,
      } satisfies CacheValue,
      isProtected: true,
    });
  }
}
