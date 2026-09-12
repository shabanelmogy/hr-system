import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useContext } from 'react';

const OfflineDatabaseContext = createContext<SQLiteDatabase | null>(null);

export function OfflineDatabaseProvider({
  database,
  children,
}: PropsWithChildren<{ database: SQLiteDatabase | null }>) {
  return (
    <OfflineDatabaseContext.Provider value={database}>
      {children}
    </OfflineDatabaseContext.Provider>
  );
}

export function SQLiteOfflineDatabaseBridge({ children }: PropsWithChildren) {
  const database = useSQLiteContext();
  return <OfflineDatabaseProvider database={database}>{children}</OfflineDatabaseProvider>;
}

export function useOfflineDatabase(): SQLiteDatabase | null {
  return useContext(OfflineDatabaseContext);
}
