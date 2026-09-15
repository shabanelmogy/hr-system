import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { secureSession } from '@/src/core/storage/secure-storage';

// Versioned so the development plaintext store is never opened as SQLCipher.
export const OFFLINE_DATABASE_NAME = 'erp-offline-v3.db';
export const OFFLINE_SCHEMA_VERSION = 3;
export const OFFLINE_SCOPE_RETENTION_DAYS = 30;

let webTransactionTail: Promise<void> = Promise.resolve();

export async function initializeOfflineDatabase(db: SQLiteDatabase): Promise<void> {
  if (Platform.OS !== 'web') {
    const key = await secureSession.getOrCreateOfflineDatabaseKey();
    await db.execAsync(`PRAGMA key = "x'${key}'";`);
  }
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = versionRow?.user_version ?? 0;
  if (version > OFFLINE_SCHEMA_VERSION) {
    throw new Error(`Offline database version ${version} is newer than supported version ${OFFLINE_SCHEMA_VERSION}.`);
  }

  if (version === 0) {
    await createVersion3Schema(db);
  } else if (version < OFFLINE_SCHEMA_VERSION) {
    // Version 1 predated per-user partitioning. It never backed a released
    // offline feature, so discard that unsafe cache rather than guessing ownership.
    await migrateToVersion3(db);
  }

  await cleanupTerminalOutbox(db);
  await pruneExpiredOfflineScopes(db);
}

export async function pruneExpiredOfflineScopes(
  db: SQLiteDatabase,
  now = new Date(),
): Promise<void> {
  const cutoff = new Date(now.getTime() - OFFLINE_SCOPE_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    .toISOString();
  await db.runAsync(
    `DELETE FROM offline_scopes AS s
     WHERE s.last_accessed_at < ?
       AND NOT EXISTS (
         SELECT 1
         FROM offline_outbox AS o
         WHERE o.user_id = s.user_id
           AND o.tenant_id = s.tenant_id
           AND o.company_id = s.company_id
           AND o.status NOT IN ('succeeded', 'blocked')
       )
       AND NOT EXISTS (
         SELECT 1
         FROM offline_records AS r
         WHERE r.user_id = s.user_id
           AND r.tenant_id = s.tenant_id
           AND r.company_id = s.company_id
           AND r.is_protected = 1
       )`,
    cutoff,
  );
}

async function migrateToVersion3(db: SQLiteDatabase): Promise<void> {
  await runInOfflineWriteTransaction(db, async (tx) => {
    await tx.execAsync(`
      DROP TABLE IF EXISTS offline_outbox;
      DROP TABLE IF EXISTS offline_sync_state;
      DROP TABLE IF EXISTS offline_records;
      DROP TABLE IF EXISTS offline_scopes;
    `);
  });
  await createVersion3Schema(db);
}

async function createVersion3Schema(db: SQLiteDatabase): Promise<void> {
  await runInOfflineWriteTransaction(db, async (tx) => {
    await tx.execAsync(`
      CREATE TABLE IF NOT EXISTS offline_scopes (
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id INTEGER NOT NULL CHECK (company_id > 0),
        created_at TEXT NOT NULL,
        last_accessed_at TEXT NOT NULL,
        PRIMARY KEY (user_id, tenant_id, company_id)
      );

      CREATE TABLE IF NOT EXISTS offline_records (
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        namespace TEXT NOT NULL,
        record_key TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        server_row_version TEXT NULL,
        server_updated_at TEXT NULL,
        local_updated_at TEXT NOT NULL,
        is_deleted INTEGER NOT NULL DEFAULT 0 CHECK (is_deleted IN (0, 1)),
        is_protected INTEGER NOT NULL DEFAULT 0 CHECK (is_protected IN (0, 1)),
        PRIMARY KEY (user_id, tenant_id, company_id, namespace, record_key),
        FOREIGN KEY (user_id, tenant_id, company_id)
          REFERENCES offline_scopes (user_id, tenant_id, company_id)
          ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS ix_offline_records_scope_namespace
        ON offline_records (user_id, tenant_id, company_id, namespace, local_updated_at DESC);

      CREATE TABLE IF NOT EXISTS offline_sync_state (
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        channel TEXT NOT NULL,
        cursor TEXT NULL,
        last_pulled_at TEXT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, tenant_id, company_id, channel),
        FOREIGN KEY (user_id, tenant_id, company_id)
          REFERENCES offline_scopes (user_id, tenant_id, company_id)
          ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS offline_outbox (
        command_id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        command_type TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        aggregate_id TEXT NULL,
        payload_json TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'conflict', 'uncertain', 'blocked', 'dead-letter')),
        attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
        base_row_version TEXT NULL,
        idempotency_key TEXT NULL,
        last_error TEXT NULL,
        next_attempt_at TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id, tenant_id, company_id)
          REFERENCES offline_scopes (user_id, tenant_id, company_id)
          ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS ix_offline_outbox_scope_status_created
        ON offline_outbox (user_id, tenant_id, company_id, status, created_at);

      CREATE UNIQUE INDEX IF NOT EXISTS ux_offline_outbox_scope_idempotency
        ON offline_outbox (user_id, tenant_id, company_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL;

      PRAGMA user_version = 3;
    `);
  });
}

async function cleanupTerminalOutbox(db: SQLiteDatabase, now = new Date()): Promise<void> {
  const cutoff = new Date(now.getTime() - OFFLINE_SCOPE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db.runAsync(
    `DELETE FROM offline_outbox
     WHERE status IN ('succeeded', 'blocked') AND updated_at < ?`,
    cutoff,
  );
}

export async function runInOfflineWriteTransaction<T>(
  db: SQLiteDatabase,
  task: (tx: SQLiteDatabase) => Promise<T>,
): Promise<T> {
  if (Platform.OS !== 'web') {
    let value: T | undefined;
    await db.withExclusiveTransactionAsync(async (tx) => {
      value = await task(tx);
    });
    return value as T;
  }

  // Expo SQLite's exclusive async transaction is unsupported on web. Serialize
  // access through this module and use the supported non-exclusive transaction.
  return runSerializedWebTransaction(async () => {
    let value: T | undefined;
    await db.withTransactionAsync(async () => {
      value = await task(db);
    });
    return value as T;
  });
}

function runSerializedWebTransaction<T>(task: () => Promise<T>): Promise<T> {
  const run = webTransactionTail.then(task, task);
  webTransactionTail = run.then(() => undefined, () => undefined);
  return run;
}
