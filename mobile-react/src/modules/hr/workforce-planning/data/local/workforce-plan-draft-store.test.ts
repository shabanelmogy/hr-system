import type { SQLiteDatabase } from 'expo-sqlite';

import { WorkforcePlanDraftStore } from './workforce-plan-draft-store';

const mockRecordGet = jest.fn();
const mockRecordPut = jest.fn();
const mockRecordRemove = jest.fn();
const mockOutboxGet = jest.fn();
const mockEnqueue = jest.fn();
const mockReplacePending = jest.fn();
const mockMarkConflict = jest.fn();
const mockMarkBlocked = jest.fn();

jest.mock('@/src/core/offline', () => ({
  runInOfflineWriteTransaction: async (
    db: unknown,
    task: (tx: unknown) => Promise<unknown>,
  ) => task(db),
  ScopedRecordStore: jest.fn().mockImplementation(() => ({
    get: mockRecordGet,
    put: mockRecordPut,
    remove: mockRecordRemove,
  })),
  OfflineOutboxRepository: jest.fn().mockImplementation(() => ({
    get: mockOutboxGet,
    enqueueWithinTransaction: mockEnqueue,
    replacePending: mockReplacePending,
    markConflict: mockMarkConflict,
    markBlocked: mockMarkBlocked,
  })),
}));

const scope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 7 } as const;
const baseDetail = {
  id: 41,
  status: 1,
  isDeleted: false,
  rowVersion: 'base-rv',
  updatedOn: '2026-09-11T08:00:00Z',
} as never;
const request = {
  titleEn: 'Plan',
  titleAr: 'Plan AR',
  description: null,
  lines: [],
  rowVersion: 'base-rv',
} as never;

describe('WorkforcePlanDraftStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordGet.mockResolvedValue(null);
    mockRecordPut.mockResolvedValue(undefined);
    mockOutboxGet.mockResolvedValue(null);
    mockEnqueue.mockResolvedValue(undefined);
    mockReplacePending.mockResolvedValue(true);
    mockMarkConflict.mockResolvedValue(undefined);
    mockMarkBlocked.mockResolvedValue(undefined);
    mockRecordRemove.mockResolvedValue(undefined);
  });

  it('persists offline-draft locally without creating an outbox command', async () => {
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    const state = await store.saveLocalDraft(scope, baseDetail, request);

    expect(state.status).toBeNull();
    expect(state.draft.commandId).toBeNull();
    expect(mockRecordPut).toHaveBeenCalledWith(expect.objectContaining({
      scope,
      key: '41',
      serverRowVersion: 'base-rv',
      value: expect.objectContaining({ commandId: null, request }),
    }));
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('promotes a local-only draft to a row-versioned outbox command when command replay is enabled', async () => {
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId: null,
        request,
        baseDetail,
        savedAt: '2026-09-11T08:00:00Z',
      },
    });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    const state = await store.queueUpdate(scope, baseDetail, request);

    expect(state.status).toBe('pending');
    expect(state.draft.commandId).toEqual(expect.any(String));
    expect(mockEnqueue).toHaveBeenCalledWith(expect.objectContaining({
      scope,
      commandType: 'workforce-plan.update-draft',
      aggregateId: '41',
      baseRowVersion: 'base-rv',
      payload: { planId: 41, request },
    }));
  });

  it('supersedes a pending replay command before saving a local-only draft', async () => {
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId: '123e4567-e89b-42d3-a456-426614174000',
        request,
        baseDetail,
        savedAt: '2026-09-11T08:00:00Z',
      },
    });
    mockOutboxGet.mockResolvedValue({
      commandId: '123e4567-e89b-42d3-a456-426614174000',
      status: 'pending',
    });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    const state = await store.saveLocalDraft(scope, baseDetail, request);

    expect(mockMarkConflict).toHaveBeenCalledWith(
      '123e4567-e89b-42d3-a456-426614174000',
      expect.stringContaining('local-only draft'),
    );
    expect(state.draft.commandId).toBeNull();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('removes a synced draft only after its exact outbox command is succeeded', async () => {
    const commandId = '123e4567-e89b-42d3-a456-426614174000';
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId,
        request,
        baseDetail,
        savedAt: '2026-09-11T08:00:00Z',
      },
    });
    mockOutboxGet.mockResolvedValue({ commandId, status: 'succeeded' });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    await expect(store.removeSynced(scope, 41, commandId)).resolves.toBe(true);

    expect(mockRecordRemove).toHaveBeenCalledWith(scope, 'workforce-plan-draft-updates', '41');
    expect(mockMarkBlocked).not.toHaveBeenCalled();
  });

  it('does not let cleanup for an older succeeded command remove a newer local draft', async () => {
    const oldCommandId = '123e4567-e89b-42d3-a456-426614174000';
    const newCommandId = '223e4567-e89b-42d3-a456-426614174000';
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId: newCommandId,
        request,
        baseDetail,
        savedAt: '2026-09-11T08:05:00Z',
      },
    });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    await expect(store.removeSynced(scope, 41, oldCommandId)).resolves.toBe(false);

    expect(mockOutboxGet).not.toHaveBeenCalled();
    expect(mockRecordRemove).not.toHaveBeenCalled();
  });

  it('blocks an unresolved replay command before discarding its local draft', async () => {
    const commandId = '123e4567-e89b-42d3-a456-426614174000';
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId,
        request,
        baseDetail,
        savedAt: '2026-09-11T08:00:00Z',
      },
    });
    mockOutboxGet.mockResolvedValue({ commandId, status: 'uncertain' });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    await store.remove(scope, 41);

    expect(mockMarkBlocked).toHaveBeenCalledWith(
      commandId,
      expect.stringContaining('discarded'),
    );
    expect(mockRecordRemove).toHaveBeenCalledWith(scope, 'workforce-plan-draft-updates', '41');
  });

  it('refuses to discard a draft while its replay command is processing', async () => {
    const commandId = '123e4567-e89b-42d3-a456-426614174000';
    mockRecordGet.mockResolvedValue({
      value: {
        planId: 41,
        commandId,
        request,
        baseDetail,
        savedAt: '2026-09-11T08:00:00Z',
      },
    });
    mockOutboxGet.mockResolvedValue({ commandId, status: 'processing' });
    const store = new WorkforcePlanDraftStore({} as SQLiteDatabase);

    await expect(store.remove(scope, 41)).rejects.toThrow('currently syncing');
    expect(mockMarkBlocked).not.toHaveBeenCalled();
    expect(mockRecordRemove).not.toHaveBeenCalled();
  });
});
