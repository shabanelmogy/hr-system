import type { SQLiteDatabase } from 'expo-sqlite';

import {
  invalidateOfflineSessionLease,
  loadOfflineSessionLease,
  saveOfflineSessionLease,
} from '../data/local/offline-session-lease';
import type { SessionResponse } from '../domain/models/auth';

export const offlineSessionLeaseUseCases = {
  save: (database: SQLiteDatabase | null, session: SessionResponse) => saveOfflineSessionLease(database, session),
  load: (database: SQLiteDatabase | null) => loadOfflineSessionLease(database),
  invalidate: () => invalidateOfflineSessionLease(),
};
