type SyncRequestListener = () => void;
const listeners = new Set<SyncRequestListener>();

export function requestOfflineSync(): void {
  for (const listener of listeners) listener();
}

export function subscribeToOfflineSyncRequests(listener: SyncRequestListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
