import type { SQLiteDatabase } from 'expo-sqlite';

import { OfflineScopeRepository } from './scope-repository';
import { normalizeOfflineScope, type OfflineScope } from './scope';

export interface ScopedRecord<T> {
  key: string;
  value: T;
  serverRowVersion: string | null;
  serverUpdatedAt: string | null;
  localUpdatedAt: string;
  isDeleted: boolean;
  isProtected?: boolean;
}

interface ScopedRecordRow {
  record_key: string;
  payload_json: string;
  server_row_version: string | null;
  server_updated_at: string | null;
  local_updated_at: string;
  is_deleted: number;
  is_protected: number;
}

export class ScopedRecordStore {
  private readonly scopes: OfflineScopeRepository;

  constructor(private readonly db: SQLiteDatabase) {
    this.scopes = new OfflineScopeRepository(db);
  }

  async put<T>(options: {
    scope: OfflineScope;
    namespace: string;
    key: string;
    value: T;
    serverRowVersion?: string | null;
    serverUpdatedAt?: string | null;
    isDeleted?: boolean;
    isProtected?: boolean;
  }): Promise<void> {
    const scope = await this.scopes.ensure(options.scope);
    const namespace = requireSegment(options.namespace, 'namespace');
    const key = requireSegment(options.key, 'record key');
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO offline_records (
         user_id, tenant_id, company_id, namespace, record_key, payload_json,
         server_row_version, server_updated_at, local_updated_at, is_deleted, is_protected
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, tenant_id, company_id, namespace, record_key)
       DO UPDATE SET
         payload_json = excluded.payload_json,
         server_row_version = excluded.server_row_version,
         server_updated_at = excluded.server_updated_at,
         local_updated_at = excluded.local_updated_at,
         is_deleted = excluded.is_deleted,
         is_protected = excluded.is_protected`,
      scope.userId,
      scope.tenantId,
      scope.companyId,
      namespace,
      key,
      JSON.stringify(options.value),
      options.serverRowVersion ?? null,
      options.serverUpdatedAt ?? null,
      now,
      options.isDeleted ? 1 : 0,
      options.isProtected ? 1 : 0,
    );
  }

  async get<T>(scope: OfflineScope, namespace: string, key: string): Promise<ScopedRecord<T> | null> {
    const normalized = await this.scopes.ensure(scope);
    const row = await this.db.getFirstAsync<ScopedRecordRow>(
      `SELECT record_key, payload_json, server_row_version, server_updated_at, local_updated_at, is_deleted, is_protected
       FROM offline_records
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND namespace = ? AND record_key = ?`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireSegment(namespace, 'namespace'),
      requireSegment(key, 'record key'),
    );
    return row ? mapRow<T>(row) : null;
  }

  async list<T>(scope: OfflineScope, namespace: string): Promise<ScopedRecord<T>[]> {
    const normalized = await this.scopes.ensure(scope);
    const rows = await this.db.getAllAsync<ScopedRecordRow>(
      `SELECT record_key, payload_json, server_row_version, server_updated_at, local_updated_at, is_deleted, is_protected
       FROM offline_records
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND namespace = ?
       ORDER BY local_updated_at DESC`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireSegment(namespace, 'namespace'),
    );
    return rows.map(mapRow<T>);
  }

  async remove(scope: OfflineScope, namespace: string, key: string): Promise<void> {
    const normalized = normalizeOfflineScope(scope);
    await this.db.runAsync(
      `DELETE FROM offline_records
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND namespace = ? AND record_key = ?`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireSegment(namespace, 'namespace'),
      requireSegment(key, 'record key'),
    );
  }
}

function mapRow<T>(row: ScopedRecordRow): ScopedRecord<T> {
  return {
    key: row.record_key,
    value: JSON.parse(row.payload_json) as T,
    serverRowVersion: row.server_row_version,
    serverUpdatedAt: row.server_updated_at,
    localUpdatedAt: row.local_updated_at,
    isDeleted: row.is_deleted === 1,
    isProtected: row.is_protected === 1,
  };
}

function requireSegment(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`Offline ${label} is required.`);
  return normalized;
}
