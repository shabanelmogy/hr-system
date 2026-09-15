import type { SQLiteDatabase } from 'expo-sqlite';

import { OfflineOutboxRepository } from './outbox';

const commandId = '123e4567-e89b-42d3-a456-426614174000';
const scope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 4 } as const;

describe('OfflineOutboxRepository recovery helpers', () => {
  it('never schedules an immediately eligible retry that can starve later batches', async () => {
    const now = new Date('2026-09-13T12:00:00.000Z');
    jest.useFakeTimers().setSystemTime(now);
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const getFirstAsync = jest.fn().mockResolvedValue({
      command_id: commandId, user_id: 'user-a', tenant_id: 'tenant-a', company_id: 4,
      command_type: 'country.update', aggregate_type: 'country', aggregate_id: '1',
      payload_json: '{}', status: 'processing', attempts: 1, base_row_version: null,
      idempotency_key: 'country-1', last_error: null, next_attempt_at: null,
      created_at: now.toISOString(), updated_at: now.toISOString(),
    });
    const repository = new OfflineOutboxRepository({ runAsync, getFirstAsync } as unknown as SQLiteDatabase);

    await repository.markFailed(commandId, 'retry', new Date(now.getTime() - 1_000).toISOString());

    expect(Date.parse(String(runAsync.mock.calls[0]?.[3]))).toBeGreaterThan(now.getTime());
    jest.useRealTimers();
  });

  it('moves a command to dead-letter after the retry budget', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const getFirstAsync = jest.fn().mockResolvedValue({
      command_id: commandId, user_id: 'user-a', tenant_id: 'tenant-a', company_id: 4,
      command_type: 'country.update', aggregate_type: 'country', aggregate_id: '1',
      payload_json: '{}', status: 'failed', attempts: 8, base_row_version: null,
      idempotency_key: 'country-1', last_error: 'retry', next_attempt_at: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    const repository = new OfflineOutboxRepository({ runAsync, getFirstAsync } as unknown as SQLiteDatabase);

    await repository.markFailed(commandId, 'still failing');

    expect(runAsync.mock.calls[0]?.[1]).toBe('dead-letter');
  });

  it('assigns a future exponential retry time when none is supplied', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const getFirstAsync = jest.fn().mockResolvedValue({
      command_id: commandId, user_id: 'user-a', tenant_id: 'tenant-a', company_id: 4,
      command_type: 'country.update', aggregate_type: 'country', aggregate_id: '1',
      payload_json: '{}', status: 'failed', attempts: 2, base_row_version: null,
      idempotency_key: 'country-1', last_error: 'retry', next_attempt_at: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    const repository = new OfflineOutboxRepository({ runAsync, getFirstAsync } as unknown as SQLiteDatabase);

    const before = Date.now();
    await repository.markFailed(commandId, 'retry');
    const retryAt = Date.parse(String(runAsync.mock.calls[0]?.[3]));
    expect(retryAt).toBeGreaterThan(before);
  });

  it('replaces only a pending/failed command instead of stacking stale row-versioned writes', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const repository = new OfflineOutboxRepository({ runAsync } as unknown as SQLiteDatabase);

    await expect(repository.replacePending(commandId, { title: 'new' }, 'AQ==')).resolves.toBe(true);
    expect(runAsync).toHaveBeenCalledTimes(1);
    expect(String(runAsync.mock.calls[0]?.[0])).toContain("status IN ('pending', 'failed')");
    expect(String(runAsync.mock.calls[0]?.[0])).toContain("status = 'pending'");
  });

  it('converts interrupted processing commands to uncertain for reconciliation', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 2 });
    const repository = new OfflineOutboxRepository({ runAsync } as unknown as SQLiteDatabase);

    await expect(repository.recoverProcessingAsUncertain(scope)).resolves.toBe(2);
    expect(String(runAsync.mock.calls[0]?.[0])).toContain("status = 'uncertain'");
    expect(runAsync.mock.calls[0]?.slice(-3)).toEqual(['user-a', 'tenant-a', 4]);
  });

  it('only re-arms an uncertain command after reconciliation proves retry is safe', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const repository = new OfflineOutboxRepository({ runAsync } as unknown as SQLiteDatabase);

    await expect(repository.resetUncertainToPending(commandId)).resolves.toBe(true);
    expect(String(runAsync.mock.calls[0]?.[0])).toContain("status = 'uncertain'");
    expect(String(runAsync.mock.calls[0]?.[0])).toContain("status = 'pending'");
  });

  it('can permanently block a command that the user explicitly discarded', async () => {
    const runAsync = jest.fn().mockResolvedValue({ changes: 1 });
    const repository = new OfflineOutboxRepository({ runAsync } as unknown as SQLiteDatabase);

    await repository.markBlocked(commandId, 'discarded');

    expect(runAsync.mock.calls[0]?.[0]).toContain('SET status = ?');
    expect(runAsync.mock.calls[0]?.[1]).toBe('blocked');
    expect(runAsync.mock.calls[0]?.[2]).toBe('discarded');
  });
});
