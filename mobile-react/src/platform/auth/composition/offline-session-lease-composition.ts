import type { SQLiteDatabase } from 'expo-sqlite';

import {
  invalidateOfflineSessionLease,
  invalidateOfflineSessionLeaseSnapshot,
  loadOfflineSessionLease,
  loadOfflineSessionLeaseSnapshot,
  saveOfflineSessionLease,
} from '../data/local/offline-session-lease';
import type { SessionResponse } from '../domain/models/auth';

export const offlineSessionLeaseUseCases = {
  save: (database: SQLiteDatabase | null, session: SessionResponse) => saveOfflineSessionLease(database, session),
  load: (database: SQLiteDatabase | null) => loadOfflineSessionLease(database),
  loadSnapshot: (database: SQLiteDatabase | null) => loadOfflineSessionLeaseSnapshot(database),
  invalidate: () => invalidateOfflineSessionLease(),
  invalidateSnapshot: (session: SessionResponse, validUntil: string) =>
    invalidateOfflineSessionLeaseSnapshot(session, validUntil),
};
