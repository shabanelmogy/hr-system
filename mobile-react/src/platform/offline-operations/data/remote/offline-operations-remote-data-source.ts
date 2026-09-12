import { apiService } from '@/src/core/api';

import type {
  OfflineOperationMode,
  ServerOfflineOperationsPolicy,
} from '../../domain/models/offline-operations-policy';
import { offlineOperationsEndpoints } from './offline-operations-endpoints';
import { offlineOperationsPolicyResponseSchema } from './offline-operations-schemas';

export interface OfflineOperationsPolicyRemoteDataSource {
  getPolicy(): Promise<ServerOfflineOperationsPolicy>;
  updatePolicy(
    modes: Readonly<Record<string, OfflineOperationMode>>,
    rowVersion: string | null,
  ): Promise<ServerOfflineOperationsPolicy>;
}

function toDomain(raw: unknown): ServerOfflineOperationsPolicy {
  const parsed = offlineOperationsPolicyResponseSchema.parse(raw);
  return Object.freeze({
    version: parsed.version,
    tenantId: parsed.tenantId,
    companyId: parsed.companyId,
    modes: Object.freeze({ ...parsed.modes }),
    capabilities: Object.freeze(parsed.capabilities.map((capability) => Object.freeze({
      id: capability.id,
      supportedModes: Object.freeze([...capability.supportedModes]),
    }))),
    rowVersion: parsed.rowVersion,
    updatedOn: parsed.updatedOn,
    updatedByUserId: parsed.updatedByUserId,
  });
}

export const offlineOperationsPolicyRemoteDataSource: OfflineOperationsPolicyRemoteDataSource = {
  async getPolicy() {
    return toDomain(await apiService.get<unknown>(offlineOperationsEndpoints.policy));
  },

  async updatePolicy(modes, rowVersion) {
    return toDomain(await apiService.put<unknown, {
      modes: Readonly<Record<string, OfflineOperationMode>>;
      rowVersion: string | null;
    }>(offlineOperationsEndpoints.policy, { modes, rowVersion }));
  },
};
