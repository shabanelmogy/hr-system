import { useMemo } from 'react';
import { connectivityService, useOfflineDatabase } from '@/src/core/offline';
import { useAuth } from '@/src/platform/auth';
import { createModuleUseCases } from '../application/module-use-cases';
import { moduleRemoteDataSource } from '../data/remote/module-remote-data-source';
import { DefaultModuleRepository } from '../data/repositories/default-module-repository';
import { ScopedModuleCatalogCache } from '../data/repositories/scoped-module-catalog-cache';

export function useModuleUseCases() {
  const database = useOfflineDatabase();
  const { session, offlineLeaseValidUntil } = useAuth();
  return useMemo(() => createModuleUseCases(new DefaultModuleRepository(
    moduleRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
    database && session && offlineLeaseValidUntil ? new ScopedModuleCatalogCache(database, {
      userId: session.userId,
      tenantId: session.tenantId,
      companyId: session.companyId,
    }, offlineLeaseValidUntil) : undefined,
  )), [database, offlineLeaseValidUntil, session]);
}
