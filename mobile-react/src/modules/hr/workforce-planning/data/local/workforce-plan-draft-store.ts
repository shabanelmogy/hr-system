import type { SQLiteDatabase } from 'expo-sqlite';

import {
  OfflineOutboxRepository,
  runInOfflineWriteTransaction,
  ScopedRecordStore,
  type OfflineScope,
} from '@/src/core/offline';
import type {
  WorkforcePlanDraftState,
  WorkforcePlanLocalDraft,
  WorkforcePlanEditingSnapshot,
} from '../../domain/models/workforce-plan-draft';
import type {
  UpdateWorkforcePlanRequest,
  WorkforcePlan,
  WorkforcePlanDetail,
} from '../../domain/models/workforce-plan';

export const WORKFORCE_PLAN_DRAFT_COMMAND = 'workforce-plan.update-draft';
const DRAFT_NAMESPACE = 'workforce-plan-draft-updates';

export class WorkforcePlanDraftStore {
  constructor(private readonly db: SQLiteDatabase) {}

  async saveLocalDraft(
    scope: OfflineScope,
    baseDetail: WorkforcePlanDetail,
    request: UpdateWorkforcePlanRequest,
    editingSnapshot: WorkforcePlanEditingSnapshot = emptyEditingSnapshot(),
  ): Promise<WorkforcePlanDraftState> {
    validateDraftBase(baseDetail, request);

    return runInOfflineWriteTransaction(this.db, async (tx) => {
      const records = new ScopedRecordStore(tx);
      const outbox = new OfflineOutboxRepository(tx);
      const existing = await records.get<WorkforcePlanLocalDraft>(
        scope,
        DRAFT_NAMESPACE,
        String(baseDetail.id),
      );

      if (existing?.value.commandId) {
        const command = await outbox.get(existing.value.commandId);
        if (command?.status === 'processing') {
          throw new Error('This workforce-plan draft is currently syncing and cannot be changed locally.');
        }
        if (command && ['conflict', 'uncertain', 'blocked'].includes(command.status)) {
          throw new Error('This local draft has a sync outcome that must be resolved before editing it again.');
        }
        if (command && ['pending', 'failed'].includes(command.status)) {
          await outbox.markConflict(
            command.commandId,
            'The queued update was superseded by a local-only draft after offline command execution was disabled.',
          );
        }
      }

      const draft = createLocalDraft(baseDetail, request, editingSnapshot, null);
      await putDraft(records, scope, baseDetail, request, draft);
      return { draft, status: null, lastError: null };
    });
  }

  async queueUpdate(
    scope: OfflineScope,
    baseDetail: WorkforcePlanDetail,
    request: UpdateWorkforcePlanRequest,
    editingSnapshot: WorkforcePlanEditingSnapshot = emptyEditingSnapshot(),
  ): Promise<WorkforcePlanDraftState> {
    validateDraftBase(baseDetail, request);

    return runInOfflineWriteTransaction(this.db, async (tx) => {
      const records = new ScopedRecordStore(tx);
      const outbox = new OfflineOutboxRepository(tx);
      const existing = await records.get<WorkforcePlanLocalDraft>(
        scope,
        DRAFT_NAMESPACE,
        String(baseDetail.id),
      );

      let commandId = existing?.value.commandId ?? createCommandId();
      if (existing?.value.commandId) {
        const command = await outbox.get(commandId);
        if (command && ['processing', 'conflict', 'uncertain', 'blocked'].includes(command.status)) {
          throw new Error('This local draft has a sync outcome that must be resolved before editing it again.');
        }
        if (command && ['pending', 'failed'].includes(command.status)) {
          const replaced = await outbox.replacePending(
            commandId,
            { planId: baseDetail.id, request },
            request.rowVersion,
          );
          if (!replaced) throw new Error('The queued draft changed while it was being updated.');
        } else {
          commandId = createCommandId();
          await outbox.enqueueWithinTransaction(createCommand(scope, baseDetail.id, commandId, request));
        }
      } else {
        await outbox.enqueueWithinTransaction(createCommand(scope, baseDetail.id, commandId, request));
      }

      const draft = createLocalDraft(baseDetail, request, editingSnapshot, commandId);
      await putDraft(records, scope, baseDetail, request, draft);
      return { draft, status: 'pending', lastError: null };
    });
  }

  async get(scope: OfflineScope, planId: number): Promise<WorkforcePlanDraftState | null> {
    const record = await new ScopedRecordStore(this.db).get<WorkforcePlanLocalDraft>(
      scope,
      DRAFT_NAMESPACE,
      String(planId),
    );
    if (!record) return null;
    const command = record.value.commandId
      ? await new OfflineOutboxRepository(this.db).get(record.value.commandId)
      : null;
    return {
      draft: record.value,
      status: command?.status ?? null,
      lastError: command?.lastError ?? null,
    };
  }

  async list(scope: OfflineScope): Promise<WorkforcePlanDraftState[]> {
    const records = await new ScopedRecordStore(this.db).list<WorkforcePlanLocalDraft>(scope, DRAFT_NAMESPACE);
    const outbox = new OfflineOutboxRepository(this.db);
    return Promise.all(records.filter((record) => !record.isDeleted).map(async (record) => {
      const command = record.value.commandId ? await outbox.get(record.value.commandId) : null;
      return {
        draft: record.value,
        status: command?.status ?? null,
        lastError: command?.lastError ?? null,
      };
    }));
  }

  async removeSynced(
    scope: OfflineScope,
    planId: number,
    commandId: string,
  ): Promise<boolean> {
    return runInOfflineWriteTransaction(this.db, async (tx) => {
      const records = new ScopedRecordStore(tx);
      const outbox = new OfflineOutboxRepository(tx);
      const existing = await records.get<WorkforcePlanLocalDraft>(
        scope,
        DRAFT_NAMESPACE,
        String(planId),
      );

      // A user may have saved a newer draft after the previous command completed.
      // Never let cleanup for an older successful command remove that newer work.
      if (!existing || existing.value.commandId !== commandId) return false;

      const command = await outbox.get(commandId);
      if (command?.status !== 'succeeded') return false;

      await records.remove(scope, DRAFT_NAMESPACE, String(planId));
      return true;
    });
  }

  async retry(scope: OfflineScope, planId: number): Promise<WorkforcePlanDraftState | null> {
    const record = await new ScopedRecordStore(this.db).get<WorkforcePlanLocalDraft>(scope, DRAFT_NAMESPACE, String(planId));
    if (!record?.value.commandId) return this.get(scope, planId);
    const outbox = new OfflineOutboxRepository(this.db);
    const command = await outbox.get(record.value.commandId);
    if (command?.status !== 'dead-letter') return this.get(scope, planId);
    await outbox.resetDeadLetterToPending(command.commandId);
    return this.get(scope, planId);
  }

  async remove(scope: OfflineScope, planId: number): Promise<void> {
    await runInOfflineWriteTransaction(this.db, async (tx) => {
      const records = new ScopedRecordStore(tx);
      const outbox = new OfflineOutboxRepository(tx);
      const existing = await records.get<WorkforcePlanLocalDraft>(
        scope,
        DRAFT_NAMESPACE,
        String(planId),
      );

      if (existing?.value.commandId) {
        const command = await outbox.get(existing.value.commandId);
        if (command?.status === 'processing') {
          throw new Error('This workforce-plan draft is currently syncing and cannot be discarded.');
        }
        if (command && command.status !== 'succeeded' && command.status !== 'blocked') {
          await outbox.markBlocked(
            command.commandId,
            'The local workforce-plan draft was discarded before synchronization completed.',
          );
        }
      }

      await records.remove(scope, DRAFT_NAMESPACE, String(planId));
    });
  }
}

export function toLocalWorkforcePlan(state: WorkforcePlanDraftState): WorkforcePlan {
  const { baseDetail, request } = state.draft;
  const linesCount = request.lines.length;
  const newHireSlots = request.lines.reduce((sum, line) => sum + line.newHireSlots, 0);
  const replacementSlots = request.lines.reduce((sum, line) => sum + line.replacementSlots, 0);
  return {
    id: baseDetail.id,
    planSeriesId: baseDetail.planSeriesId,
    planCode: baseDetail.planCode,
    fiscalYearId: baseDetail.fiscalYearId,
    revisionNumber: baseDetail.revisionNumber,
    titleEn: request.titleEn,
    titleAr: request.titleAr,
    status: baseDetail.status,
    linesCount,
    newHireSlots,
    replacementSlots,
    plannedHiringSlots: newHireSlots + replacementSlots,
    isEffective: false,
    isDeleted: baseDetail.isDeleted,
    createdOn: baseDetail.createdOn,
    updatedOn: baseDetail.updatedOn,
    rowVersion: request.rowVersion,
  };
}

function validateDraftBase(
  baseDetail: WorkforcePlanDetail,
  request: UpdateWorkforcePlanRequest,
): void {
  if (baseDetail.status !== 1 || baseDetail.isDeleted) {
    throw new Error('Only an active draft workforce plan can be saved for offline sync.');
  }
  if (!request.rowVersion.trim() || request.rowVersion !== baseDetail.rowVersion) {
    throw new Error('The offline draft must be based on the currently loaded row version.');
  }
}

function createLocalDraft(
  baseDetail: WorkforcePlanDetail,
  request: UpdateWorkforcePlanRequest,
  editingSnapshot: WorkforcePlanEditingSnapshot,
  commandId: string | null,
): WorkforcePlanLocalDraft {
  return {
    planId: baseDetail.id,
    commandId,
    request,
    baseDetail,
    editingSnapshot,
    savedAt: new Date().toISOString(),
  };
}

function putDraft(
  records: ScopedRecordStore,
  scope: OfflineScope,
  baseDetail: WorkforcePlanDetail,
  request: UpdateWorkforcePlanRequest,
  draft: WorkforcePlanLocalDraft,
): Promise<void> {
  return records.put({
    scope,
    namespace: DRAFT_NAMESPACE,
    key: String(baseDetail.id),
    value: draft,
    serverRowVersion: request.rowVersion,
    serverUpdatedAt: baseDetail.updatedOn,
    isProtected: true,
  });
}

function createCommand(
  scope: OfflineScope,
  planId: number,
  commandId: string,
  request: UpdateWorkforcePlanRequest,
) {
  return {
    commandId,
    scope,
    commandType: WORKFORCE_PLAN_DRAFT_COMMAND,
    aggregateType: 'workforce-plan',
    aggregateId: String(planId),
    payload: { planId, request },
    baseRowVersion: request.rowVersion,
  };
}

function createCommandId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function emptyEditingSnapshot(): WorkforcePlanEditingSnapshot {
  return { fiscalYears: [], positions: [], branches: [], fiscalPeriodsByYear: {} };
}
