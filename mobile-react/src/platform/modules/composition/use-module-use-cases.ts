import { useMemo } from 'react';
import { connectivityService } from '@/src/core/offline';
import { createModuleUseCases } from '../application/module-use-cases';
import { moduleRemoteDataSource } from '../data/remote/module-remote-data-source';
import { DefaultModuleRepository } from '../data/repositories/default-module-repository';

export function useModuleUseCases() {
  return useMemo(() => createModuleUseCases(new DefaultModuleRepository(
    moduleRemoteDataSource,
    () => connectivityService.getSnapshot().isOnline,
  )), []);
}
