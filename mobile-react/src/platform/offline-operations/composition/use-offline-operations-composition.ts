import { useMemo } from 'react';

import { ScopedRecordStore, useOfflineDatabase, type OfflineScope } from '@/src/core/offline';
import { useAuth } from '@/src/platform/auth';

import {
  createOfflineOperationsPolicyUseCases,
  type OfflineOperationsPolicyUseCases,
} from '../application/offline-operations-policy-use-cases';
import { coreOfflineCapabilityPolicy } from '../data/core-offline-capability-policy';
import { DefaultOfflineOperationsPolicyRepository } from '../data/default-offline-operations-policy-repository';
import { offlineOperationsPolicyRemoteDataSource } from '../data/remote/offline-operations-remote-data-source';

export interface OfflineOperationsComposition {
  readonly scope: OfflineScope | null;
  readonly useCases: OfflineOperationsPolicyUseCases | null;
}

export function useOfflineOperationsComposition(): OfflineOperationsComposition {
  const database = useOfflineDatabase();
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const tenantId = session?.tenantId ?? null;
  const companyId = session?.companyId ?? null;

  const scope = useMemo<OfflineScope | null>(() => (
    userId && tenantId && companyId && companyId > 0
      ? { userId, tenantId, companyId }
      : null
  ), [companyId, tenantId, userId]);

  const useCases = useMemo<OfflineOperationsPolicyUseCases | null>(() => {
    if (!database) return null;
    const repository = new DefaultOfflineOperationsPolicyRepository(
      offlineOperationsPolicyRemoteDataSource,
      new ScopedRecordStore(database),
    );
    return createOfflineOperationsPolicyUseCases(repository, coreOfflineCapabilityPolicy);
  }, [database]);

  return { scope, useCases };
}
