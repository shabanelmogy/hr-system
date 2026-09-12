import type { SQLiteDatabase } from 'expo-sqlite';

import { ApiError } from '@/src/core/api';
import type { OutboxCommand } from '@/src/core/offline';
import type {
  UpdateWorkforcePlanRequest,
  WorkforcePlanDetail,
} from '../domain/models/workforce-plan';
import { WorkforcePlanDraftPilot } from './workforce-plan-draft-pilot';

const mockScope = { userId: 'user-a', tenantId: 'tenant-a', companyId: 7 } as const;
const mockRequest: UpdateWorkforcePlanRequest = {
  titleEn: 'Offline plan',
  titleAr: 'خطة دون اتصال',
  description: 'queued change',
  lines: [],
  rowVersion: 'AQIDBA==',
};
const mockCommandId = '123e4567-e89b-42d3-a456-426614174000';
let mockCommand: OutboxCommand;
let mockCleanupObservedStatuses: string[] = [];

function mockMatchesCommandScope(scope: typeof mockScope): boolean {
  return scope.userId === mockCommand.scope.userId
    && scope.tenantId === mockCommand.scope.tenantId
    && scope.companyId === mockCommand.scope.companyId;
}

const mockRemoteUpdate = jest.fn();
const mockRemoteGetById = jest.fn();
const mockRemoveSynced = jest.fn(async () => {
  mockCleanupObservedStatuses.push(mockCommand.status);
  return true;
});

const mockOutbox = {
  recoverProcessingAsUncertain: jest.fn(async (scope: typeof mockScope) => {
    if (!mockMatchesCommandScope(scope)) return 0;
    if (mockCommand.status !== 'processing') return 0;
    mockCommand = { ...mockCommand, status: 'uncertain' };
    return 1;
  }),
  listByCommandType: jest.fn(async (scope: typeof mockScope) =>
    mockMatchesCommandScope(scope) ? [{ ...mockCommand }] : []),
  resetUncertainToPending: jest.fn(async () => {
    if (mockCommand.status !== 'uncertain') return false;
    mockCommand = { ...mockCommand, status: 'pending', lastError: null };
    return true;
  }),
  listPending: jest.fn(async (scope: typeof mockScope) =>
    mockMatchesCommandScope(scope) && ['pending', 'failed'].includes(mockCommand.status)
      ? [{ ...mockCommand }]
      : []),
  markProcessing: jest.fn(async () => {
    if (!['pending', 'failed'].includes(mockCommand.status)) return false;
    mockCommand = {
      ...mockCommand,
      status: 'processing',
      attempts: mockCommand.attempts + 1,
    };
    return true;
  }),
  markSucceeded: jest.fn(async () => {
    mockCommand = { ...mockCommand, status: 'succeeded', lastError: null };
  }),
  markFailed: jest.fn(async (_commandId: string, error: string) => {
    mockCommand = { ...mockCommand, status: 'failed', lastError: error };
  }),
  markConflict: jest.fn(async (_commandId: string, error: string) => {
    mockCommand = { ...mockCommand, status: 'conflict', lastError: error };
  }),
  markUncertain: jest.fn(async (_commandId: string, error: string) => {
    mockCommand = { ...mockCommand, status: 'uncertain', lastError: error };
  }),
};

jest.mock('@/src/core/offline', () => {
  const { SyncCoordinator } = jest.requireActual('@/src/core/offline/sync-coordinator') as {
    SyncCoordinator: typeof import('@/src/core/offline/sync-coordinator').SyncCoordinator;
  };
  return {
    connectivityService: { getSnapshot: () => ({ isOnline: true }) },
    OfflineOutboxRepository: jest.fn().mockImplementation(() => mockOutbox),
    SyncCoordinator,
    offlineScopeKey: (scope: typeof mockScope) =>
      `${scope.userId}:${scope.tenantId}:${scope.companyId}`,
    useConnectivity: jest.fn(),
    useOfflineDatabase: jest.fn(),
  };
});

jest.mock('@/src/platform/auth', () => ({ useAuth: jest.fn() }));
jest.mock('@/src/platform/offline-operations', () => ({ useOfflineOperationsPolicy: jest.fn() }));

jest.mock('../data/local/workforce-plan-draft-store', () => ({
  WORKFORCE_PLAN_DRAFT_COMMAND: 'workforce-plan.update-draft',
  WorkforcePlanDraftStore: jest.fn().mockImplementation(() => ({
    queueUpdate: jest.fn(),
    saveLocalDraft: jest.fn(),
    get: jest.fn(),
    remove: jest.fn(),
    removeSynced: mockRemoveSynced,
  })),
}));

jest.mock('../data/repositories/default-workforce-plan-repository', () => ({
  DefaultWorkforcePlanRepository: jest.fn().mockImplementation(() => ({
    update: mockRemoteUpdate,
    getById: mockRemoteGetById,
  })),
}));

const matchingServerDetail: WorkforcePlanDetail = {
  id: 41,
  planSeriesId: '123e4567-e89b-42d3-a456-426614174001',
  planCode: 'WP-41',
  fiscalYearId: 9,
  revisionNumber: 1,
  previousRevisionId: null,
  titleEn: mockRequest.titleEn,
  titleAr: mockRequest.titleAr,
  description: mockRequest.description ?? null,
  status: 1,
  submittedOn: null,
  submittedById: null,
  approvedOn: null,
  approvedById: null,
  rejectedOn: null,
  rejectedById: null,
  decisionReason: null,
  activatedOn: null,
  supersededOn: null,
  lines: [],
  isDeleted: false,
  createdOn: '2026-09-11T08:00:00Z',
  updatedOn: '2026-09-11T08:10:00Z',
  rowVersion: 'BQYHCA==',
};

describe('WorkforcePlanDraftPilot replay lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCleanupObservedStatuses = [];
    mockCommand = {
      commandId: mockCommandId,
      scope: mockScope,
      commandType: 'workforce-plan.update-draft',
      aggregateType: 'workforce-plan',
      aggregateId: '41',
      payload: { planId: 41, request: mockRequest },
      status: 'pending',
      attempts: 0,
      baseRowVersion: mockRequest.rowVersion,
      idempotencyKey: null,
      lastError: null,
      nextAttemptAt: null,
      createdAt: '2026-09-11T08:00:00Z',
      updatedAt: '2026-09-11T08:00:00Z',
    };
  });

  it('marks a successful replay succeeded before cleaning the matching local draft', async () => {
    mockRemoteUpdate.mockResolvedValue(matchingServerDetail);
    const pilot = new WorkforcePlanDraftPilot({} as SQLiteDatabase);

    await expect(pilot.sync(mockScope, { authenticated: true, readOnly: false }))
      .resolves.toMatchObject({ processed: 1, succeeded: 1, conflicts: 0 });

    expect(mockCommand.status).toBe('succeeded');
    expect(mockCleanupObservedStatuses).toEqual(['succeeded']);
    expect(mockRemoveSynced).toHaveBeenCalledWith(mockScope, 41, mockCommandId);
    expect(mockRemoteGetById).not.toHaveBeenCalled();
  });

  it('reconciles a 409 as success when the server already contains the intended update', async () => {
    mockRemoteUpdate.mockRejectedValue(new ApiError(409, 'concurrency conflict'));
    mockRemoteGetById.mockResolvedValue(matchingServerDetail);
    const pilot = new WorkforcePlanDraftPilot({} as SQLiteDatabase);

    await expect(pilot.sync(mockScope, { authenticated: true, readOnly: false }))
      .resolves.toMatchObject({ processed: 1, succeeded: 1, conflicts: 0 });

    expect(mockRemoteGetById).toHaveBeenCalledWith(41);
    expect(mockCommand.status).toBe('succeeded');
    expect(mockCleanupObservedStatuses).toEqual(['succeeded']);
  });

  it('keeps the local draft and stops replay when reconciliation sees a concurrent server change', async () => {
    mockRemoteUpdate.mockRejectedValue(new ApiError(409, 'concurrency conflict'));
    mockRemoteGetById.mockResolvedValue({
      ...matchingServerDetail,
      titleEn: 'Changed by another user',
      rowVersion: 'CQoLDA==',
    });
    const pilot = new WorkforcePlanDraftPilot({} as SQLiteDatabase);

    await expect(pilot.sync(mockScope, { authenticated: true, readOnly: false }))
      .resolves.toMatchObject({ processed: 1, succeeded: 0, conflicts: 1 });

    expect(mockCommand.status).toBe('conflict');
    expect(mockRemoveSynced).not.toHaveBeenCalled();
    expect(mockCleanupObservedStatuses).toEqual([]);
  });

  it('serializes a replacement company scope instead of silently reusing the active old-scope sync', async () => {
    let releaseUpdate!: (detail: WorkforcePlanDetail) => void;
    let markUpdateStarted!: () => void;
    const updateStarted = new Promise<void>((resolve) => {
      markUpdateStarted = resolve;
    });
    const updateFinished = new Promise<WorkforcePlanDetail>((resolve) => {
      releaseUpdate = resolve;
    });
    mockRemoteUpdate.mockImplementationOnce(() => {
      markUpdateStarted();
      return updateFinished;
    });
    const pilot = new WorkforcePlanDraftPilot({} as SQLiteDatabase);
    const replacementScope = { ...mockScope, companyId: 8 } as const;

    const oldScopeRun = pilot.sync(mockScope, { authenticated: true, readOnly: false });
    await updateStarted;
    const replacementScopeRun = pilot.sync(replacementScope, { authenticated: true, readOnly: false });

    expect(mockOutbox.recoverProcessingAsUncertain).not.toHaveBeenCalledWith(replacementScope);
    releaseUpdate(matchingServerDetail);
    await expect(oldScopeRun).resolves.toMatchObject({ succeeded: 1 });
    await expect(replacementScopeRun).resolves.toMatchObject({ processed: 0 });
    expect(mockOutbox.recoverProcessingAsUncertain).toHaveBeenCalledWith(replacementScope);
  });
});
