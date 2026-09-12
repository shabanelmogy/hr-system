import type { SQLiteDatabase } from 'expo-sqlite';

import { normalizeOfflineScope, type OfflineScope } from './scope';

export class OfflineScopeRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async ensure(scope: OfflineScope): Promise<OfflineScope> {
    const normalized = normalizeOfflineScope(scope);
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO offline_scopes (user_id, tenant_id, company_id, created_at, last_accessed_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (user_id, tenant_id, company_id)
       DO UPDATE SET last_accessed_at = excluded.last_accessed_at`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      now,
      now,
    );
    return normalized;
  }

  async purge(scope: OfflineScope): Promise<void> {
    const normalized = normalizeOfflineScope(scope);
    await this.db.runAsync(
      'DELETE FROM offline_scopes WHERE user_id = ? AND tenant_id = ? AND company_id = ?',
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
    );
  }
}
