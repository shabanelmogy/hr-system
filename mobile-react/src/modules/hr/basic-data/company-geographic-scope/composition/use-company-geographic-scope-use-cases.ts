import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createCompanyGeographicScopeUseCases } from '../application/company-geographic-scope-use-cases';
import { companyGeographicScopeRemoteDataSource } from '../data/remote/company-geographic-scope-remote-data-source';
import { DefaultCompanyGeographicScopeRepository } from '../data/repositories/default-company-geographic-scope-repository';

export function useCompanyGeographicScopeUseCases() {
  return useMemo(() => createCompanyGeographicScopeUseCases(
    new DefaultCompanyGeographicScopeRepository(
      companyGeographicScopeRemoteDataSource,
      () => connectivityService.getSnapshot().isOnline,
    ),
  ), []);
}
