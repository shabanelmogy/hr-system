import { useMemo } from 'react';

import { connectivityService } from '@/src/core/offline';
import { createDistrictUseCases } from '../application/district-use-cases';
import { districtRemoteDataSource } from '../data/remote/district-remote-data-source';
import { DefaultDistrictRepository } from '../data/repositories/default-district-repository';

export function useDistrictUseCases() {
  return useMemo(() => createDistrictUseCases(new DefaultDistrictRepository(
    districtRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
