import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createAdministrationUseCases } from '../application/administration-use-cases';
import { administrationRemoteDataSource } from '../data/remote/administration-remote-data-source';
import { DefaultAdministrationRepository } from '../data/repositories/default-administration-repository';

export function useAdministrationUseCases() {
  return useMemo(() => createAdministrationUseCases(new DefaultAdministrationRepository(
    administrationRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
