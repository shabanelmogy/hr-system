import type { SQLiteDatabase } from 'expo-sqlite';

import { runInOfflineWriteTransaction } from './database';
import { normalizeOfflineScope, type OfflineScope } from './scope';
import { OfflineScopeRepository } from './scope-repository';

export type OutboxCommandStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'conflict'
  | 'uncertain'
  | 'blocked';

export interface OutboxCommand {
  commandId: string;
  scope: OfflineScope;
  commandType: string;
  aggregateType: string;
  aggregateId: string | null;
  payload: unknown;
  status: OutboxCommandStatus;
  attempts: number;
  baseRowVersion: string | null;
  idempotencyKey: string | null;
  lastError: string | null;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnqueueOutboxCommand {
  commandId: string;
  scope: OfflineScope;
  commandType: string;
  aggregateType: string;
  aggregateId?: string | null;
  payload: unknown;
  baseRowVersion?: string | null;
  idempotencyKey?: string | null;
}

interface OutboxRow {
  command_id: string;
  user_id: string;
  tenant_id: string;
  company_id: number;
  command_type: string;
  aggregate_type: string;
  aggregate_id: string | null;
  payload_json: string;
  status: OutboxCommandStatus;
  attempts: number;
  base_row_version: string | null;
  idempotency_key: string | null;
  last_error: string | null;
  next_attempt_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutboxStore {
  listPending(scope: OfflineScope, limit?: number): Promise<OutboxCommand[]>;
  markProcessing(commandId: string): Promise<boolean>;
  markSucceeded(commandId: string): Promise<void>;
  markFailed(commandId: string, error: string, nextAttemptAt?: string | null): Promise<void>;
  markConflict(commandId: string, error: string): Promise<void>;
  markUncertain(commandId: string, error: string): Promise<void>;
}

export class OfflineOutboxRepository implements OutboxStore {
  constructor(private readonly db: SQLiteDatabase) {}

  async enqueue(command: EnqueueOutboxCommand): Promise<void> {
    await runInOfflineWriteTransaction(this.db, async (tx) => {
      await new OfflineOutboxRepository(tx).enqueueWithinTransaction(command);
    });
  }

  async enqueueWithinTransaction(command: EnqueueOutboxCommand): Promise<void> {
    requireUuid(command.commandId);
    const commandType = requireText(command.commandType, 'command type');
    const aggregateType = requireText(command.aggregateType, 'aggregate type');
    const scope = normalizeOfflineScope(command.scope);
    const now = new Date().toISOString();

    await new OfflineScopeRepository(this.db).ensure(scope);
    await this.db.runAsync(
      `INSERT INTO offline_outbox (
        command_id, user_id, tenant_id, company_id, command_type, aggregate_type, aggregate_id,
        payload_json, status, attempts, base_row_version, idempotency_key,
        last_error, next_attempt_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?, NULL, NULL, ?, ?)`,
      command.commandId,
      scope.userId,
      scope.tenantId,
      scope.companyId,
      commandType,
      aggregateType,
      command.aggregateId ?? null,
      JSON.stringify(command.payload),
      command.baseRowVersion ?? null,
      command.idempotencyKey ?? null,
      now,
      now,
    );
  }

  async replacePending(
    commandId: string,
    payload: unknown,
    baseRowVersion: string,
  ): Promise<boolean> {
    const result = await this.db.runAsync(
      `UPDATE offline_outbox
       SET payload_json = ?, base_row_version = ?, status = 'pending', attempts = 0,
           last_error = NULL, next_attempt_at = NULL, updated_at = ?
       WHERE command_id = ? AND status IN ('pending', 'failed')`,
      JSON.stringify(payload),
      requireText(baseRowVersion, 'base row version'),
      new Date().toISOString(),
      requireUuid(commandId),
    );
    return result.changes === 1;
  }

  async get(commandId: string): Promise<OutboxCommand | null> {
    const row = await this.db.getFirstAsync<OutboxRow>(
      'SELECT * FROM offline_outbox WHERE command_id = ?',
      requireUuid(commandId),
    );
    return row ? mapOutboxRow(row) : null;
  }

  async listByCommandType(scope: OfflineScope, commandType: string): Promise<OutboxCommand[]> {
    const normalized = normalizeOfflineScope(scope);
    const rows = await this.db.getAllAsync<OutboxRow>(
      `SELECT * FROM offline_outbox
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND command_type = ?
       ORDER BY created_at ASC`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      requireText(commandType, 'command type'),
    );
    return rows.map(mapOutboxRow);
  }

  async recoverProcessingAsUncertain(scope: OfflineScope): Promise<number> {
    const normalized = normalizeOfflineScope(scope);
    const result = await this.db.runAsync(
      `UPDATE offline_outbox
       SET status = 'uncertain', last_error = ?, updated_at = ?
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND status = 'processing'`,
      'The previous sync attempt was interrupted before its outcome was recorded.',
      new Date().toISOString(),
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
    );
    return result.changes;
  }

  async resetUncertainToPending(commandId: string): Promise<boolean> {
    const result = await this.db.runAsync(
      `UPDATE offline_outbox
       SET status = 'pending', last_error = NULL, next_attempt_at = NULL, updated_at = ?
       WHERE command_id = ? AND status = 'uncertain'`,
      new Date().toISOString(),
      requireUuid(commandId),
    );
    return result.changes === 1;
  }

  async listPending(scope: OfflineScope, limit = 50): Promise<OutboxCommand[]> {
    const normalized = normalizeOfflineScope(scope);
    const safeLimit = Math.min(250, Math.max(1, Math.trunc(limit)));
    const now = new Date().toISOString();
    const rows = await this.db.getAllAsync<OutboxRow>(
      `SELECT * FROM offline_outbox
       WHERE user_id = ? AND tenant_id = ? AND company_id = ? AND status IN ('pending', 'failed')
         AND (next_attempt_at IS NULL OR next_attempt_at <= ?)
       ORDER BY created_at ASC
       LIMIT ?`,
      normalized.userId,
      normalized.tenantId,
      normalized.companyId,
      now,
      safeLimit,
    );
    return rows.map(mapOutboxRow);
  }

  async markProcessing(commandId: string): Promise<boolean> {
    const result = await this.db.runAsync(
      `UPDATE offline_outbox
       SET status = 'processing', attempts = attempts + 1, updated_at = ?
       WHERE command_id = ? AND status IN ('pending', 'failed')`,
      new Date().toISOString(),
      commandId,
    );
    return result.changes === 1;
  }

  markSucceeded(commandId: string): Promise<void> {
    return this.updateStatus(commandId, 'succeeded', null, null);
  }

  markFailed(commandId: string, error: string, nextAttemptAt: string | null = null): Promise<void> {
    return this.updateStatus(commandId, 'failed', error, nextAttemptAt);
  }

  markConflict(commandId: string, error: string): Promise<void> {
    return this.updateStatus(commandId, 'conflict', error, null);
  }

  markUncertain(commandId: string, error: string): Promise<void> {
    return this.updateStatus(commandId, 'uncertain', error, null);
  }

  markBlocked(commandId: string, error: string): Promise<void> {
    return this.updateStatus(commandId, 'blocked', error, null);
  }

  private async updateStatus(
    commandId: string,
    status: OutboxCommandStatus,
    error: string | null,
    nextAttemptAt: string | null,
  ): Promise<void> {
    await this.db.runAsync(
      `UPDATE offline_outbox
       SET status = ?, last_error = ?, next_attempt_at = ?, updated_at = ?
       WHERE command_id = ?`,
      status,
      error,
      nextAttemptAt,
      new Date().toISOString(),
      commandId,
    );
  }
}

function mapOutboxRow(row: OutboxRow): OutboxCommand {
  return {
    commandId: row.command_id,
    scope: { userId: row.user_id, tenantId: row.tenant_id, companyId: row.company_id },
    commandType: row.command_type,
    aggregateType: row.aggregate_type,
    aggregateId: row.aggregate_id,
    payload: JSON.parse(row.payload_json) as unknown,
    status: row.status,
    attempts: row.attempts,
    baseRowVersion: row.base_row_version,
    idempotencyKey: row.idempotency_key,
    lastError: row.last_error,
    nextAttemptAt: row.next_attempt_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireUuid(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw new Error('Outbox commandId must be a UUID.');
  }
  return normalized;
}

function requireText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`Outbox ${label} is required.`);
  return normalized;
}
