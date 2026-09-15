import { initializeOfflineDatabase, pruneExpiredOfflineScopes } from './database';

const mockExecAsync = jest.fn();
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockGetFirstAsync = jest.fn().mockResolvedValue({ user_version: 0 });
const mockWithExclusiveTransactionAsync = jest.fn(async (callback: (tx: unknown) => Promise<void>) => callback({
  execAsync: mockExecAsync,
}));

jest.mock('@/src/core/storage/secure-storage', () => ({
  secureSession: { getOrCreateOfflineDatabaseKey: jest.fn().mockResolvedValue('a'.repeat(64)) },
}));

describe('offline database contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirstAsync.mockResolvedValue({ user_version: 0 });
  });

  it('sets SQLCipher key before WAL and schema access', async () => {
    const database = {
      execAsync: mockExecAsync,
      runAsync: mockRunAsync,
      getFirstAsync: mockGetFirstAsync,
      withExclusiveTransactionAsync: mockWithExclusiveTransactionAsync,
    } as never;

    await initializeOfflineDatabase(database);

    expect(mockExecAsync.mock.calls[0]?.[0]).toContain('PRAGMA key');
    expect(mockExecAsync.mock.calls[1]?.[0]).toContain('journal_mode = WAL');
    expect(mockGetFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');
  });

  it('protects user records and retains dead-letter/conflict/uncertain commands', async () => {
    await pruneExpiredOfflineScopes({ runAsync: mockRunAsync } as never, new Date('2026-09-13T00:00:00.000Z'));
    const sql = String(mockRunAsync.mock.calls[0]?.[0]);
    expect(sql).toContain("o.status NOT IN ('succeeded', 'blocked')");
    expect(sql).toContain('r.is_protected = 1');
  });
});
