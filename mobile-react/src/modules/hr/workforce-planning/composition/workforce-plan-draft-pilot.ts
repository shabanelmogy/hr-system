import { useMemo } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ApiError, getAxiosRequestContextSignal } from '@/src/core/api';
import {
  connectivityService,
  OfflineOutboxRepository,
  SyncCoordinator,
  offlineScopeKey,
  useConnectivity,
  useOfflineDatabase,
  type OfflineScope,
  type OutboxCommand,
  type SyncAuthorization,
  type SyncCommandOutcome,
  type SyncRunResult,
} from '@/src/core/offline';
import { OFFLINE_CAPABILITY_IDS } from '@/src/core/offline-policy';
import { useAuth } from '@/src/platform/auth';
import { useOfflineOperationsPolicy } from '@/src/platform/offline-operations';
import type {
  WorkforcePlanDraftState,
  WorkforcePlanEditingSnapshot,
} from '../domain/models/workforce-plan-draft';
import type {
  UpdateWorkforcePlanRequest,
  WorkforcePlanDetail,
} from '../domain/models/workforce-plan';
import { workforcePlanMatchesDraftUpdate } from '../domain/policies/workforce-plan-draft-reconciliation';
import {
  WORKFORCE_PLAN_DRAFT_COMMAND,
  WorkforcePlanDraftStore,
  toLocalWorkforcePlan,
} from '../data/local/workforce-plan-draft-store';
import { DefaultWorkforcePlanRepository } from '../data/repositories/default-workforce-plan-repository';

interface WorkforcePlanDraftPayload {
  planId: number;
  request: UpdateWorkforcePlanRequest;
}

export class WorkforcePlanDraftPilot {
  private readonly drafts: WorkforcePlanDraftStore;
  private readonly outbox: OfflineOutboxRepository;
  private remote = new DefaultWorkforcePlanRepository();
  private readonly coordinator: SyncCoordinator;
  private activeSync: { scopeKey: string; promise: Promise<SyncRunResult> } | null = null;

  constructor(db: SQLiteDatabase) {
    this.drafts = new WorkforcePlanDraftStore(db);
    this.outbox = new OfflineOutboxRepository(db);
    this.coordinator = new SyncCoordinator(
      this.outbox,
      () => connectivityService.getSnapshot(),
    );
    this.coordinator.registerHandler({
      commandType: WORKFORCE_PLAN_DRAFT_COMMAND,
      replaySafety: 'row-versioned',
      execute: (command) => this.execute(command),
    });
  }

  queue(
    scope: OfflineScope,
    baseDetail: WorkforcePlanDetail,
    request: UpdateWorkforcePlanRequest,
    editingSnapshot: WorkforcePlanEditingSnapshot,
    queueForReplay: boolean,
  ): Promise<WorkforcePlanDraftState> {
    return queueForReplay
      ? this.drafts.queueUpdate(scope, baseDetail, request, editingSnapshot)
      : this.drafts.saveLocalDraft(scope, baseDetail, request, editingSnapshot);
  }

  get(scope: OfflineScope, planId: number): Promise<WorkforcePlanDraftState | null> {
    return this.drafts.get(scope, planId);
  }

  async list(scope: OfflineScope) {
    const states = await this.drafts.list(scope);
    return states.map((state) => ({ state, plan: toLocalWorkforcePlan(state) }));
  }

  discard(scope: OfflineScope, planId: number): Promise<void> {
    return this.drafts.remove(scope, planId);
  }

  retry(scope: OfflineScope, planId: number): Promise<WorkforcePlanDraftState | null> {
    return this.drafts.retry(scope, planId);
  }

  sync(scope: OfflineScope, authorization: SyncAuthorization): Promise<SyncRunResult> {
    const scopeKey = offlineScopeKey(scope);
    const active = this.activeSync;
    if (active) {
      if (active.scopeKey === scopeKey) return active.promise;

      // A company/tenant transition may ask the same database-backed pilot to
      // sync a new scope while the old request context is still unwinding.
      // Serialize those runs so the replacement scope is not silently skipped.
      return active.promise.then(
        () => this.sync(scope, authorization),
        () => this.sync(scope, authorization),
      );
    }

    const operation = this.syncInternal(scope, authorization);
    const tracked = operation.finally(() => {
      if (this.activeSync?.promise === tracked) this.activeSync = null;
    });
    this.activeSync = { scopeKey, promise: tracked };
    return tracked;
  }

  private async syncInternal(scope: OfflineScope, authorization: SyncAuthorization) {
    if (!authorization.authenticated || !connectivityService.getSnapshot().isOnline) {
      return this.coordinator.run(scope, authorization);
    }

    // Bind every replay/reconciliation request in this run to the authenticated
    // context that started it. A company/tenant switch rotates and aborts this
    // signal, so an old-scope command can never attach to the replacement token.
    this.remote = new DefaultWorkforcePlanRepository(
      undefined,
      getAxiosRequestContextSignal(),
    );

    await this.outbox.recoverProcessingAsUncertain(scope);
    const commands = await this.outbox.listByCommandType(scope, WORKFORCE_PLAN_DRAFT_COMMAND);
    for (const command of commands.filter((candidate) => candidate.status === 'uncertain')) {
      const outcome = await this.reconcile(command);
      if (outcome.kind === 'succeeded') {
        await this.outbox.markSucceeded(command.commandId);
      } else if (outcome.kind === 'retry') {
        await this.outbox.resetUncertainToPending(command.commandId);
      } else if (outcome.kind === 'conflict') {
        await this.outbox.markConflict(command.commandId, outcome.error);
      }
    }

    const result = await this.coordinator.run(scope, authorization);
    await this.cleanupSucceededDrafts(scope);
    return result;
  }

  private async execute(command: OutboxCommand): Promise<SyncCommandOutcome> {
    const payload = readPayload(command);
    if (!payload || !command.baseRowVersion || payload.request.rowVersion !== command.baseRowVersion) {
      return { kind: 'conflict', error: 'The queued workforce-plan draft payload is invalid.' };
    }

    try {
      await this.remote.update(payload.planId, payload.request);
      return { kind: 'succeeded' };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0 || error.status === 409 || error.status >= 500) {
          return this.reconcile(command);
        }
        if ([400, 403, 404, 423].includes(error.status)) {
          return { kind: 'conflict', error: error.message };
        }
        return { kind: 'retry', error: error.message };
      }
      return {
        kind: 'uncertain',
        error: error instanceof Error ? error.message : 'The draft update outcome is uncertain.',
      };
    }
  }

  private async cleanupSucceededDrafts(scope: OfflineScope): Promise<void> {
    const commands = await this.outbox.listByCommandType(scope, WORKFORCE_PLAN_DRAFT_COMMAND);
    for (const command of commands.filter((candidate) => candidate.status === 'succeeded')) {
      const payload = readPayload(command);
      if (payload) {
        await this.drafts.removeSynced(scope, payload.planId, command.commandId);
      }
    }
  }

  private async reconcile(command: OutboxCommand): Promise<SyncCommandOutcome> {
    const payload = readPayload(command);
    if (!payload || !command.baseRowVersion) {
      return { kind: 'conflict', error: 'The queued workforce-plan draft cannot be reconciled.' };
    }

    try {
      const current = await this.remote.getById(payload.planId);
      if (workforcePlanMatchesDraftUpdate(current, payload.request)) {
        return { kind: 'succeeded' };
      }
      if (current.rowVersion === command.baseRowVersion && current.status === 1 && !current.isDeleted) {
        return { kind: 'retry', error: 'The server still has the base draft; retry is safe.' };
      }
      return {
        kind: 'conflict',
        error: 'The workforce plan changed on the server while this local draft was waiting to sync.',
      };
    } catch (error) {
      return {
        kind: 'uncertain',
        error: error instanceof Error ? error.message : 'Unable to reconcile the draft with the server.',
      };
    }
  }
}

const pilots = new WeakMap<SQLiteDatabase, WorkforcePlanDraftPilot>();

function getWorkforcePlanDraftPilot(database: SQLiteDatabase): WorkforcePlanDraftPilot {
  const existing = pilots.get(database);
  if (existing) return existing;
  const created = new WorkforcePlanDraftPilot(database);
  pilots.set(database, created);
  return created;
}

export function useWorkforcePlanDraftPilot() {
  const database = useOfflineDatabase();
  const connectivity = useConnectivity();
  const offlinePolicy = useOfflineOperationsPolicy();
  const { session, status, isServerAuthenticated } = useAuth();
  const userId = session?.userId ?? null;
  const tenantId = session?.tenantId ?? null;
  const companyId = session?.companyId ?? null;
  const offlineDraftAllowed = offlinePolicy.loaded
    && offlinePolicy.canSaveDraft(OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft);
  const offlineReplayAllowed = offlineDraftAllowed
    && offlinePolicy.canExecuteOfflineCommand(OFFLINE_CAPABILITY_IDS.workforcePlanUpdateDraft);
  const policyFresh = offlinePolicy.loaded
    && offlinePolicy.policy?.status === 'ready'
    && Boolean(offlinePolicy.snapshot);
  // The local pilot must remain available when policy loading fails or a
  // server downgrade blocks new replay admission. Existing drafts still need
  // to be viewed, edited, discarded, and eventually drained.
  const pilot = useMemo(
    () => database ? getWorkforcePlanDraftPilot(database) : null,
    [database],
  );
  const scope = useMemo<OfflineScope | null>(() =>
    userId && tenantId && companyId ? ({ userId, tenantId, companyId }) : null,
  [companyId, tenantId, userId]);

  return {
    pilot,
    scope,
    isOnline: connectivity.isOnline,
    authenticated: status === 'authenticated' && isServerAuthenticated,
    canSaveDraft: offlineDraftAllowed,
    policyFresh,
    canExecuteOfflineCommand: offlineReplayAllowed,
  };
}

function readPayload(command: OutboxCommand): WorkforcePlanDraftPayload | null {
  const value = command.payload;
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<WorkforcePlanDraftPayload>;
  if (!Number.isInteger(candidate.planId) || Number(candidate.planId) <= 0) return null;
  if (!candidate.request || typeof candidate.request !== 'object') return null;
  const request = candidate.request as Partial<UpdateWorkforcePlanRequest>;
  if (
    typeof request.titleEn !== 'string' ||
    typeof request.titleAr !== 'string' ||
    typeof request.rowVersion !== 'string' ||
    !Array.isArray(request.lines)
  ) {
    return null;
  }
  return candidate as WorkforcePlanDraftPayload;
}
