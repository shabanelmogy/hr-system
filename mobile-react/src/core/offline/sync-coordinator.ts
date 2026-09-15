import type { ConnectivitySnapshot } from './connectivity-service';
import type { OutboxCommand, OutboxStore } from './outbox';
import type { OfflineScope } from './scope';

export type ReplaySafety = 'idempotent' | 'row-versioned';

export type SyncCommandOutcome =
  | { kind: 'succeeded' }
  | { kind: 'retry'; error: string; nextAttemptAt?: string | null }
  | { kind: 'conflict'; error: string }
  | { kind: 'uncertain'; error: string };

export interface SyncCommandHandler {
  commandType: string;
  replaySafety: ReplaySafety;
  execute(command: OutboxCommand): Promise<SyncCommandOutcome>;
}

export interface SyncRunResult {
  processed: number;
  succeeded: number;
  failed: number;
  conflicts: number;
  uncertain: number;
  skippedUnsafe: number;
  skippedOffline: boolean;
  skippedUnauthorized: boolean;
  deadLettered: number;
}

export interface SyncAuthorization {
  authenticated: boolean;
  readOnly: boolean;
}

export class SyncCoordinator {
  private readonly handlers = new Map<string, SyncCommandHandler>();
  private activeRun: Promise<SyncRunResult> | null = null;

  constructor(
    private readonly outbox: OutboxStore,
    private readonly getConnectivity: () => Pick<ConnectivitySnapshot, 'isOnline'>,
  ) {}

  registerHandler(handler: SyncCommandHandler): () => void {
    if (this.handlers.has(handler.commandType)) {
      throw new Error(`A sync handler is already registered for ${handler.commandType}.`);
    }
    this.handlers.set(handler.commandType, handler);
    return () => {
      if (this.handlers.get(handler.commandType) === handler) {
        this.handlers.delete(handler.commandType);
      }
    };
  }

  run(scope: OfflineScope, authorization: SyncAuthorization): Promise<SyncRunResult> {
    if (this.activeRun) return this.activeRun;
    this.activeRun = this.runInternal(scope, authorization).finally(() => {
      this.activeRun = null;
    });
    return this.activeRun;
  }

  private async runInternal(
    scope: OfflineScope,
    authorization: SyncAuthorization,
  ): Promise<SyncRunResult> {
    const result: SyncRunResult = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      conflicts: 0,
      uncertain: 0,
      skippedUnsafe: 0,
      skippedOffline: false,
      skippedUnauthorized: false,
      deadLettered: 0,
    };

    if (!authorization.authenticated || authorization.readOnly) {
      result.skippedUnauthorized = true;
      return result;
    }

    if (!this.getConnectivity().isOnline) {
      result.skippedOffline = true;
      return result;
    }

    const registeredTypes = [...this.handlers.keys()];
    if (registeredTypes.length === 0) {
      const unknown = await this.outbox.listPending(scope);
      result.skippedUnsafe = unknown.length;
      return result;
    }
    const listPending = (limit: number) => this.outbox.listPendingByTypes(scope, registeredTypes, limit);

    // Drain bounded batches. Querying only registered command types prevents an
    // unknown future module from starving handlers already installed in this build.
    const seen = new Set<string>();
    for (let batch = 0; batch < 20; batch += 1) {
      const commands = (await listPending(25)).filter((command) => !seen.has(command.commandId));
      if (commands.length === 0) break;
      let progressed = false;
      for (const command of commands) {
        seen.add(command.commandId);
        const handler = this.handlers.get(command.commandType);
        if (!handler) continue;
        if (!hasRequiredReplayGuard(command, handler.replaySafety)) {
          await this.outbox.markBlocked(command.commandId, 'Replay guard is missing for this command.');
          result.skippedUnsafe += 1;
          progressed = true;
          continue;
        }

        if (!this.getConnectivity().isOnline) break;
        if (!(await this.outbox.markProcessing(command.commandId))) continue;
        progressed = true;
        result.processed += 1;

        try {
        const outcome = await handler.execute(command);
        if (outcome.kind === 'succeeded') {
          await this.outbox.markSucceeded(command.commandId);
          result.succeeded += 1;
        } else if (outcome.kind === 'retry') {
          await this.outbox.markFailed(command.commandId, outcome.error, outcome.nextAttemptAt ?? null);
          result.failed += 1;
          if (command.attempts >= 7) result.deadLettered += 1;
        } else if (outcome.kind === 'conflict') {
          await this.outbox.markConflict(command.commandId, outcome.error);
          result.conflicts += 1;
        } else {
          await this.outbox.markUncertain(command.commandId, outcome.error);
          result.uncertain += 1;
        }
        } catch (error) {
          await this.outbox.markFailed(command.commandId, errorMessage(error));
          result.failed += 1;
          if (command.attempts >= 7) result.deadLettered += 1;
        }
      }
      if (!progressed) break;
      if (!this.getConnectivity().isOnline) break;
    }

    return result;
  }
}

function hasRequiredReplayGuard(command: OutboxCommand, safety: ReplaySafety): boolean {
  return safety === 'idempotent'
    ? Boolean(command.idempotencyKey?.trim())
    : Boolean(command.baseRowVersion?.trim());
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Sync command failed.';
}
