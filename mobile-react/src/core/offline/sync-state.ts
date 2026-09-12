import type { SQLiteDatabase } from 'expo-sqlite';

import type { OfflineScope } from './scope';
import { OfflineScopeRepository } from './scope-repository';

export interface OfflineSyncState {
  channel: string;
  cursor: string | null;
  lastPulledAt: string | null;
  updatedAt: string;
}

interface SyncStateRow {
  channel: string;
  cursor: string | null;
  last_pulled_at: string | null;
  updated_at: string;
}

export class OfflineSyncStateRepository {
  private readonly scopes: OfflineScopeRepository;

  constructor(private readonly db: SQLiteDatabase) {
    this.scopes = new OfflineScopeRepository(db);
  }

  async get(scope: OfflineScope, channel: string): Promise<OfflineSyncState | null> {
    const normalized = await this.scopes.ensure(scope);
    const row = await this.db.getFirstAsync<SyncStateRow>(
      `SELECT channel, cursor, last_pulled_at, updated_at
       FROM offline_sync_state
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND channel = ?`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireChannel(channel),
    );
    return row ? {
      channel: row.channel,
      cursor: row.cursor,
      lastPulledAt: row.last_pulled_at,
      updatedAt: row.updated_at,
    } : null;
  }

  async set(scope: OfflineScope, channel: string, cursor: string | null): Promise<void> {
    const normalized = await this.scopes.ensure(scope);
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO offline_sync_state (
         user_id, tenant_id, company_id, channel, cursor, last_pulled_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, tenant_id, company_id, channel)
       DO UPDATE SET cursor = excluded.cursor, last_pulled_at = excluded.last_pulled_at, updated_at = excluded.updated_at`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireChannel(channel),
      cursor,
      now,
      now,
    );
  }
}

function requireChannel(channel: string): string {
  const normalized = channel.trim();
  if (!normalized) throw new Error('Offline sync channel is required.');
  return normalized;
}
