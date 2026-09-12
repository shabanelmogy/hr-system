import type {
  OfflineOperationMode,
  OfflineOperationsScope,
  ServerOfflineOperationsPolicy,
  ServerOfflineOperationsPolicySnapshot,
} from '../models/offline-operations-policy';

export interface OfflineOperationsPolicyRepository {
  fetchRemote(scope: OfflineOperationsScope): Promise<ServerOfflineOperationsPolicy>;
  updateRemote(
    scope: OfflineOperationsScope,
    modes: Readonly<Record<string, OfflineOperationMode>>,
    rowVersion: string | null,
  ): Promise<ServerOfflineOperationsPolicy>;
  readCache(scope: OfflineOperationsScope): Promise<unknown | null>;
  writeCache(
    scope: OfflineOperationsScope,
    snapshot: ServerOfflineOperationsPolicySnapshot,
  ): Promise<void>;
}
