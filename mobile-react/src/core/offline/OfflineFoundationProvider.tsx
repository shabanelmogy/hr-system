import { SQLiteProvider } from 'expo-sqlite';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { ConnectivityProvider } from './ConnectivityProvider';
import { initializeOfflineDatabase, OFFLINE_DATABASE_NAME } from './database';
import { registerOfflineMaintenanceTask } from './background-maintenance';
import {
  OfflineDatabaseProvider,
  SQLiteOfflineDatabaseBridge,
} from './OfflineDatabaseContext';

export function OfflineFoundationProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    void registerOfflineMaintenanceTask().catch(() => undefined);
  }, []);
  if (Platform.OS === 'web') {
    return (
      <ConnectivityProvider>
        <OfflineDatabaseProvider database={null}>{children}</OfflineDatabaseProvider>
      </ConnectivityProvider>
    );
  }

  return (
    <ConnectivityProvider>
      <SQLiteProvider
        databaseName={OFFLINE_DATABASE_NAME}
        onInit={initializeOfflineDatabase}>
        <SQLiteOfflineDatabaseBridge>{children}</SQLiteOfflineDatabaseBridge>
      </SQLiteProvider>
    </ConnectivityProvider>
  );
}
