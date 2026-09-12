import type { ConnectivitySnapshot } from './connectivity-service';
import type { OutboxCommand, OutboxStore } from './outbox';
import { SyncCoordinator } from './sync-coordinator';

const scope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 4 } as const;
const authorization = { authenticated: true, readOnly: false } as const;

function command(overrides: Partial<OutboxCommand> = {}): OutboxCommand {
  return {
    commandId: '123e4567-e89b-42d3-a456-426614174000',
    scope,
    commandType: 'countries.update',
    aggregateType: 'country',
    aggregateId: '1',
    payload: { name: 'Egypt' },
    status: 'pending',
    attempts: 0,
    baseRowVersion: null,
    idempotencyKey: null,
    lastError: null,
    nextAttemptAt: null,
    createdAt: '2026-09-09T00:00:00.000Z',
    updatedAt: '2026-09-09T00:00:00.000Z',
    ...overrides,
  };
}

function createOutbox(commands: OutboxCommand[]) {
  const store: jest.Mocked<OutboxStore> = {
    listPending: jest.fn().mockResolvedValue(commands),
    markProcessing: jest.fn().mockResolvedValue(true),
    markSucceeded: jest.fn().mockResolvedValue(undefined),
    markFailed: jest.fn().mockResolvedValue(undefined),
    markConflict: jest.fn().mockResolvedValue(undefined),
    markUncertain: jest.fn().mockResolvedValue(undefined),
  };
  return store;
}

describe('SyncCoordinator', () => {
  it('never replays an unregistered command', async () => {
    const outbox = createOutbox([command()]);
    const coordinator = new SyncCoordinator(outbox, () => ({ isOnline: true }));

    await expect(coordinator.run(scope, authorization)).resolves.toMatchObject({ skippedUnsafe: 1, processed: 0 });
    expect(outbox.markProcessing).not.toHaveBeenCalled();
  });

  it('requires the replay guard declared by the explicit handler', async () => {
    const outbox = createOutbox([command()]);
    const coordinator = new SyncCoordinator(outbox, () => ({ isOnline: true }));
    const execute = jest.fn().mockResolvedValue({ kind: 'succeeded' as const });
    coordinator.registerHandler({
      commandType: 'countries.update',
      replaySafety: 'row-versioned',
      execute,
    });

    await expect(coordinator.run(scope, authorization)).resolves.toMatchObject({ skippedUnsafe: 1, processed: 0 });
    expect(execute).not.toHaveBeenCalled();
  });

  it('runs a registered idempotent command only when an idempotency key exists', async () => {
    const outbox = createOutbox([command({ idempotencyKey: 'create-country-123' })]);
    const connectivity: Pick<ConnectivitySnapshot, 'isOnline'> = { isOnline: true };
    const coordinator = new SyncCoordinator(outbox, () => connectivity);
    coordinator.registerHandler({
      commandType: 'countries.update',
      replaySafety: 'idempotent',
      execute: async () => ({ kind: 'succeeded' }),
    });

    await expect(coordinator.run(scope, authorization)).resolves.toMatchObject({ processed: 1, succeeded: 1 });
    expect(outbox.markSucceeded).toHaveBeenCalledWith('123e4567-e89b-42d3-a456-426614174000');
  });

  it('does not process queued commands without authenticated writable authorization', async () => {
    const outbox = createOutbox([command({ idempotencyKey: 'create-country-123' })]);
    const coordinator = new SyncCoordinator(outbox, () => ({ isOnline: true }));
    coordinator.registerHandler({
      commandType: 'countries.update',
      replaySafety: 'idempotent',
      execute: async () => ({ kind: 'succeeded' }),
    });

    await expect(coordinator.run(scope, { authenticated: false, readOnly: false }))
      .resolves.toMatchObject({ skippedUnauthorized: true, processed: 0 });
    await expect(coordinator.run(scope, { authenticated: true, readOnly: true }))
      .resolves.toMatchObject({ skippedUnauthorized: true, processed: 0 });
    expect(outbox.markProcessing).not.toHaveBeenCalled();
  });
});
