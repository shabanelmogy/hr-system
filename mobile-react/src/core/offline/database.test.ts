import { initializeOfflineDatabase, pruneExpiredOfflineScopes } from './database';

const mockExecAsync = jest.fn();
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockGetFirstAsync = jest.fn().mockResolvedValue({ user_version: 0 });
const mockTxGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockWithExclusiveTransactionAsync = jest.fn(async (callback: (tx: unknown) => Promise<void>) => callback({
  execAsync: mockExecAsync,
  runAsync: mockRunAsync,
  getFirstAsync: mockTxGetFirstAsync,
}));

jest.mock('@/src/core/storage/secure-storage', () => ({
  secureSession: { getOrCreateOfflineDatabaseKey: jest.fn().mockResolvedValue('a'.repeat(64)) },
}));

describe('offline database contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFirstAsync.mockResolvedValue({ user_version: 0 });
    mockTxGetFirstAsync.mockResolvedValue(null);
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

  it('preserves every legacy table under its source schema version without destructive SQL', async () => {
    mockGetFirstAsync.mockResolvedValue({ user_version: 2 });
    mockTxGetFirstAsync.mockImplementation((_sql: string, name: string) =>
      name.endsWith('_legacy_v2') ? Promise.resolve(null) : Promise.resolve({ name }));
    const database = {
      execAsync: mockExecAsync,
      runAsync: mockRunAsync,
      getFirstAsync: mockGetFirstAsync,
      withExclusiveTransactionAsync: mockWithExclusiveTransactionAsync,
    } as never;

    await initializeOfflineDatabase(database);

    const migrationSql = mockExecAsync.mock.calls.map(([sql]) => String(sql)).join('\n');
    expect(migrationSql).toContain('ALTER TABLE offline_outbox RENAME TO offline_outbox_legacy_v2');
    expect(migrationSql).toContain('ALTER TABLE offline_records RENAME TO offline_records_legacy_v2');
    expect(migrationSql).not.toContain('DROP TABLE');
  });
});
