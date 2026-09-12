import { renderHook } from '@testing-library/react-native';

import { useWorkforcePlanDraftPilot } from './workforce-plan-draft-pilot';

let mockCanSaveDraft = false;
let mockCanExecuteOfflineCommand = false;
const mockRegisterHandler = jest.fn();
const mockCoordinatorRun = jest.fn();

jest.mock('@/src/core/offline', () => ({
  connectivityService: { getSnapshot: () => ({ isOnline: false }) },
  OfflineOutboxRepository: jest.fn(),
  SyncCoordinator: jest.fn().mockImplementation(() => ({
    registerHandler: mockRegisterHandler,
    run: mockCoordinatorRun,
  })),
  offlineScopeKey: (scope: { userId: string; tenantId: string; companyId: number }) =>
    `${scope.userId}:${scope.tenantId}:${scope.companyId}`,
  useConnectivity: () => ({ isOnline: false }),
  useOfflineDatabase: () => ({ name: 'offline-test-db' }),
}));

jest.mock('@/src/platform/auth', () => ({
  useAuth: () => ({
    status: 'authenticated',
    session: { userId: 'user-a', tenantId: 'tenant-a', companyId: 7 },
  }),
}));

jest.mock('@/src/platform/offline-operations', () => ({
  useOfflineOperationsPolicy: () => ({
    loaded: true,
    canSaveDraft: () => mockCanSaveDraft,
    canExecuteOfflineCommand: () => mockCanExecuteOfflineCommand,
  }),
}));

describe('workforce plan offline draft pilot policy gate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanSaveDraft = false;
    mockCanExecuteOfflineCommand = false;
  });

  it('does not construct or expose local draft support in online-only mode', async () => {
    const { result } = await renderHook(() => useWorkforcePlanDraftPilot());
    const { SyncCoordinator } = jest.requireMock('@/src/core/offline') as {
      SyncCoordinator: jest.Mock;
    };

    expect(result.current.scope).toEqual({
      userId: 'user-a',
      tenantId: 'tenant-a',
      companyId: 7,
    });
    expect(result.current.pilot).toBeNull();
    expect(result.current.canExecuteOfflineCommand).toBe(false);
    expect(SyncCoordinator).not.toHaveBeenCalled();
  });

  it('exposes local draft persistence without command replay in offline-draft mode', async () => {
    mockCanSaveDraft = true;

    const { result } = await renderHook(() => useWorkforcePlanDraftPilot());

    expect(result.current.pilot).not.toBeNull();
    expect(result.current.canExecuteOfflineCommand).toBe(false);
    expect(mockRegisterHandler).toHaveBeenCalledWith(expect.objectContaining({
      commandType: 'workforce-plan.update-draft',
      replaySafety: 'row-versioned',
    }));
  });

  it('exposes row-versioned replay only in offline-command mode', async () => {
    mockCanSaveDraft = true;
    mockCanExecuteOfflineCommand = true;

    const { result } = await renderHook(() => useWorkforcePlanDraftPilot());

    expect(result.current.pilot).not.toBeNull();
    expect(result.current.canExecuteOfflineCommand).toBe(true);
  });
});
