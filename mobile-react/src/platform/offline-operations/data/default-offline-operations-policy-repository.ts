import { ApiError } from '@/src/core/api';
import {
  connectivityService,
  type OfflineScope,
  type ScopedRecordStore,
} from '@/src/core/offline';

import {
  OfflineOperationsPolicyConflictError,
  OfflineOperationsRemoteUnavailableError,
  type OfflineOperationMode,
  type ServerOfflineOperationsPolicy,
  type ServerOfflineOperationsPolicySnapshot,
} from '../domain/models/offline-operations-policy';
import type { OfflineOperationsPolicyRepository } from '../domain/repositories/offline-operations-policy-repository';
import type { OfflineOperationsPolicyRemoteDataSource } from './remote/offline-operations-remote-data-source';

const POLICY_NAMESPACE = 'offline-operations.server-policy-cache';
const POLICY_RECORD_KEY = 'policy-v1';

type PolicyRecordStore = Pick<ScopedRecordStore, 'get' | 'put'>;

export class DefaultOfflineOperationsPolicyRepository implements OfflineOperationsPolicyRepository {
  constructor(
    private readonly remote: OfflineOperationsPolicyRemoteDataSource,
    private readonly records: PolicyRecordStore,
  ) {}

  fetchRemote(_scope: OfflineScope): Promise<ServerOfflineOperationsPolicy> {
    return this.requireRemote(() => this.remote.getPolicy());
  }

  updateRemote(
    _scope: OfflineScope,
    modes: Readonly<Record<string, OfflineOperationMode>>,
    rowVersion: string | null,
  ): Promise<ServerOfflineOperationsPolicy> {
    return this.requireRemote(() => this.remote.updatePolicy(modes, rowVersion));
  }

  async readCache(scope: OfflineScope): Promise<unknown | null> {
    const record = await this.records.get<unknown>(scope, POLICY_NAMESPACE, POLICY_RECORD_KEY);
    if (!record || record.isDeleted) return null;
    return record.value;
  }

  async writeCache(
    scope: OfflineScope,
    snapshot: ServerOfflineOperationsPolicySnapshot,
  ): Promise<void> {
    await this.records.put({
      scope,
      namespace: POLICY_NAMESPACE,
      key: POLICY_RECORD_KEY,
      value: snapshot,
      serverRowVersion: snapshot.rowVersion,
      serverUpdatedAt: snapshot.serverUpdatedOn,
    });
  }

  private async requireRemote<T>(operation: () => Promise<T>): Promise<T> {
    if (!connectivityService.getSnapshot().isOnline) {
      throw new OfflineOperationsRemoteUnavailableError('No network connection is available.');
    }

    try {
      return await operation();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        throw new OfflineOperationsPolicyConflictError(error.problem?.detail ?? error.message);
      }
      if (error instanceof ApiError && (
        error.status === 0
        || error.status === 408
        || error.status === 429
        || error.status >= 500
      )) {
        throw new OfflineOperationsRemoteUnavailableError(error.message);
      }
      throw error;
    }
  }
}
