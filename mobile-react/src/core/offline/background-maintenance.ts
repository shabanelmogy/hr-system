import * as BackgroundTask from 'expo-background-task';
import { BackgroundTaskResult } from 'expo-background-task';
import * as SQLite from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import { initializeOfflineDatabase, OFFLINE_DATABASE_NAME, pruneExpiredOfflineScopes } from './database';

export const OFFLINE_MAINTENANCE_TASK = 'erp-offline-maintenance';

TaskManager.defineTask(OFFLINE_MAINTENANCE_TASK, async () => {
  if (Platform.OS === 'web') return BackgroundTaskResult.Success;
  try {
    const database = await SQLite.openDatabaseAsync(OFFLINE_DATABASE_NAME);
    await initializeOfflineDatabase(database);
    await pruneExpiredOfflineScopes(database);
    await database.closeAsync();
    return BackgroundTaskResult.Success;
  } catch {
    // Headless execution intentionally performs local maintenance only. It has
    // no React auth/policy context, so it must never invent a replay authority.
    return BackgroundTaskResult.Failed;
  }
});

export async function registerOfflineMaintenanceTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (await BackgroundTask.getStatusAsync() !== BackgroundTask.BackgroundTaskStatus.Available) return;
  if (await TaskManager.isTaskRegisteredAsync(OFFLINE_MAINTENANCE_TASK)) return;
  await BackgroundTask.registerTaskAsync(OFFLINE_MAINTENANCE_TASK, { minimumInterval: 15 });
}
