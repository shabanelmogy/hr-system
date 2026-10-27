import { useMemo } from 'react';
import { connectivityService } from '@/src/core/offline';
import { createSystemLocalizationUseCases } from '../application/system-localization-use-cases';
import { systemLocalizationRemoteDataSource } from '../data/remote/system-localization-remote-data-source';
import { DefaultSystemLocalizationRepository } from '../data/repositories/default-system-localization-repository';
export function useSystemLocalizationUseCases(){return useMemo(()=>createSystemLocalizationUseCases(new DefaultSystemLocalizationRepository(systemLocalizationRemoteDataSource,()=>connectivityService.getSnapshot().isOnline)),[]);}
