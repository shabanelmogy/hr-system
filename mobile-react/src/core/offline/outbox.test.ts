import type { SQLiteDatabase } from 'expo-sqlite';

import { OfflineOutboxRepository } from './outbox';

const commandId = '123e4567-e89b-42d3-a456-426614174000';
const scope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 4 } as const;

describe('OfflineOutboxRepository recovery helpers', () => {
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
