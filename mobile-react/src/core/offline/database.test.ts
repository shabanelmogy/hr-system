import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { secureSession } from '@/src/core/storage/secure-storage';
import { initializeOfflineDatabase, pruneExpiredOfflineScopes, runInOfflineWriteTransaction } from './database';

const mockExecAsync = jest.fn();
const mockRunAsync = jest.fn().mockResolvedValue({ changes: 0 });
const mockGetFirstAsync = jest.fn().mockResolvedValue({ user_version: 0 });
const mockTxGetFirstAsync = jest.fn().mockResolvedValue(null);
const mockOpenDatabaseAsync = jest.fn();
const mockConnections: ReturnType<typeof createConnection>[] = [];

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: (...args: unknown[]) => mockOpenDatabaseAsync(...args) }));
jest.mock('@/src/core/storage/secure-storage', () => ({
  secureSession: { getOrCreateOfflineDatabaseKey: jest.fn().mockResolvedValue('a'.repeat(64)) },
}));

function createConnection() {
  let keyed = false;
  const statements: string[] = [];
  const execAsync = jest.fn(async (sql: string) => {
    statements.push(sql);
    if (sql.startsWith('PRAGMA key')) keyed = true;
    else if (!keyed) throw new Error('file is not a database');
  });
  return {
    statements, execAsync,
    runAsync: jest.fn(async (...args: unknown[]) => {
      if (!keyed) throw new Error('file is not a database');
      return mockRunAsync(...args);
    }),
    getFirstAsync: mockTxGetFirstAsync,
    closeAsync: jest.fn().mockResolvedValue(undefined),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
      await execAsync('BEGIN');
      try { await callback(); await execAsync('COMMIT'); }
      catch (error) { await execAsync('ROLLBACK'); throw error; }
    }),
  };
}

function database() {
  return {
    databasePath: '/private/databases/erp-offline-v3.db', options: { enableChangeListener: true },
    execAsync: mockExecAsync, runAsync: mockRunAsync, getFirstAsync: mockGetFirstAsync,
    withExclusiveTransactionAsync: jest.fn(() => { throw new Error('unkeyed Expo transaction'); }),
  } as unknown as SQLiteDatabase;
}

describe('offline database contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks(); mockConnections.length = 0;
    mockGetFirstAsync.mockResolvedValue({ user_version: 0 });
    mockTxGetFirstAsync.mockResolvedValue(null);
    jest.mocked(secureSession.getOrCreateOfflineDatabaseKey).mockResolvedValue('a'.repeat(64));
    mockOpenDatabaseAsync.mockImplementation(async () => {
      const connection = createConnection(); mockConnections.push(connection); return connection;
    });
  });

  it('keys both provider and isolated schema connection before any database operations', async () => {
    const db = database();
    await initializeOfflineDatabase(db);
    expect(mockExecAsync.mock.calls[0]?.[0]).toContain('PRAGMA key');
    expect(mockExecAsync.mock.calls[1]?.[0]).toContain('journal_mode = WAL');
    expect(mockGetFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');
    expect(mockOpenDatabaseAsync).toHaveBeenCalledWith(
      'erp-offline-v3.db', { enableChangeListener: true, useNewConnection: true }, '/private/databases',
    );
    expect(mockConnections[0].statements.slice(0, 3)).toEqual([
      `PRAGMA key = "x'${'a'.repeat(64)}'";`, 'PRAGMA foreign_keys = ON;', 'BEGIN',
    ]);
    expect(mockConnections[0].statements.some((sql) => sql.includes('CREATE TABLE'))).toBe(true);
    expect(mockConnections[0].statements.at(-1)).toBe('COMMIT');
    expect(mockConnections[0].closeAsync).toHaveBeenCalledTimes(1);
    expect(db.withExclusiveTransactionAsync).not.toHaveBeenCalled();
  });

  it('protects user records and retains dead-letter/conflict/uncertain commands', async () => {
    await pruneExpiredOfflineScopes({ runAsync: mockRunAsync } as never, new Date('2026-09-13T00:00:00.000Z'));
    const sql = String(mockRunAsync.mock.calls[0]?.[0]);
    expect(sql).toContain("o.status NOT IN ('succeeded', 'blocked')");
    expect(sql).toContain('r.is_protected = 1');
  });

  it('preserves legacy tables and keys each migration/schema connection independently', async () => {
    mockGetFirstAsync.mockResolvedValue({ user_version: 2 });
    mockTxGetFirstAsync.mockImplementation((_sql: string, name: string) =>
      name.endsWith('_legacy_v2') ? Promise.resolve(null) : Promise.resolve({ name }));
    await initializeOfflineDatabase(database());
    const sql = mockConnections.flatMap((connection) => connection.statements).join('\n');
    expect(sql).toContain('ALTER TABLE offline_outbox RENAME TO offline_outbox_legacy_v2');
    expect(sql).toContain('ALTER TABLE offline_records RENAME TO offline_records_legacy_v2');
    expect(sql).not.toContain('DROP TABLE');
    expect(mockConnections).toHaveLength(2);
    for (const connection of mockConnections) {
      expect(connection.statements[0]).toContain('PRAGMA key');
      expect(connection.closeAsync).toHaveBeenCalledTimes(1);
    }
  });

  it('rolls back failed writes and closes their connection without touching the provider', async () => {
    const failure = new Error('write failed');
    await expect(runInOfflineWriteTransaction(database(), async () => { throw failure; })).rejects.toBe(failure);
    expect(mockConnections[0].statements.at(-1)).toBe('ROLLBACK');
    expect(mockConnections[0].closeAsync).toHaveBeenCalledTimes(1);
    expect(mockExecAsync).not.toHaveBeenCalled();
  });

  it('closes a newly opened connection when secure key loading fails', async () => {
    const failure = new Error('key unavailable');
    jest.mocked(secureSession.getOrCreateOfflineDatabaseKey).mockRejectedValueOnce(failure);
    await expect(runInOfflineWriteTransaction(database(), async () => undefined)).rejects.toBe(failure);
    expect(mockConnections[0].statements).toEqual([]);
    expect(mockConnections[0].closeAsync).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid key material before SQL interpolation or BEGIN', async () => {
    jest.mocked(secureSession.getOrCreateOfflineDatabaseKey).mockResolvedValueOnce("invalid'key");
    await expect(runInOfflineWriteTransaction(database(), async () => undefined)).rejects.toThrow('256 bits');
    expect(mockConnections[0].statements).toEqual([]);
    expect(mockConnections[0].closeAsync).toHaveBeenCalledTimes(1);
  });

  it('uses independent keyed connections for concurrent writes and returns their results', async () => {
    const db = database();
    const values = await Promise.all([1, 2].map((value) => runInOfflineWriteTransaction(db, async (tx) => {
      await tx.runAsync('INSERT INTO example VALUES (?)', value); return value;
    })));
    expect(values).toEqual([1, 2]); expect(mockConnections).toHaveLength(2);
    expect(mockConnections[0]).not.toBe(mockConnections[1]);
    for (const connection of mockConnections) {
      expect(connection.statements[0]).toContain('PRAGMA key');
      expect(connection.statements.at(-1)).toBe('COMMIT');
      expect(connection.closeAsync).toHaveBeenCalledTimes(1);
    }
  });

  it('keeps web writes serialized on the supported existing connection', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    try {
      const events: string[] = [];
      const db = { withTransactionAsync: async (task: () => Promise<void>) => task() } as SQLiteDatabase;
      await Promise.all([1, 2].map((value) => runInOfflineWriteTransaction(db, async (tx) => {
        expect(tx).toBe(db); events.push(`start-${value}`); await Promise.resolve(); events.push(`end-${value}`);
      })));
      expect(events).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
      expect(mockOpenDatabaseAsync).not.toHaveBeenCalled();
    } finally { Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS }); }
  });
});
