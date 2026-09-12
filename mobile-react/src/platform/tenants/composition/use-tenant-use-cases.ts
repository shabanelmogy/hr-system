import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createTenantUseCases } from '../application/tenant-use-cases';
import { tenantRemoteDataSource } from '../data/remote/tenant-remote-data-source';
import { DefaultTenantRepository } from '../data/repositories/default-tenant-repository';

export function useTenantUseCases() {
  return useMemo(() => createTenantUseCases(new DefaultTenantRepository(
    tenantRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
