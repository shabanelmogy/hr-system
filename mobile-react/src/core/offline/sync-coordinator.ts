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
    };

    if (!authorization.authenticated || authorization.readOnly) {
      result.skippedUnauthorized = true;
      return result;
    }

    if (!this.getConnectivity().isOnline) {
      result.skippedOffline = true;
      return result;
    }

    const commands = await this.outbox.listPending(scope);
    for (const command of commands) {
      const handler = this.handlers.get(command.commandType);
      if (!handler || !hasRequiredReplayGuard(command, handler.replaySafety)) {
        result.skippedUnsafe += 1;
        continue;
      }

      if (!this.getConnectivity().isOnline) break;
      if (!(await this.outbox.markProcessing(command.commandId))) continue;
      result.processed += 1;

      try {
        const outcome = await handler.execute(command);
        if (outcome.kind === 'succeeded') {
          await this.outbox.markSucceeded(command.commandId);
          result.succeeded += 1;
        } else if (outcome.kind === 'retry') {
          await this.outbox.markFailed(command.commandId, outcome.error, outcome.nextAttemptAt ?? null);
          result.failed += 1;
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
      }
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
