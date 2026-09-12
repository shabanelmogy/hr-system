import { useMemo } from 'react';
import { connectivityService } from '@/src/core/offline';
import { createTenantAdminUseCases } from '../application/tenant-admin-use-cases';
import { tenantAdminRemoteDataSource } from '../data/remote/tenant-admin-remote-data-source';
import { DefaultTenantAdminRepository } from '../data/repositories/default-tenant-admin-repository';

export function useTenantAdminUseCases() {
  return useMemo(() => createTenantAdminUseCases(new DefaultTenantAdminRepository(
    tenantAdminRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
