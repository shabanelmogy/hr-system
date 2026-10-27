import { useMemo } from 'react';
import { connectivityService } from '@/src/core/offline';
import { createCompanyLocalizationUseCases } from '../application/company-localization-use-cases';
import { companyLocalizationRemoteDataSource } from '../data/remote/company-localization-remote-data-source';
import { DefaultCompanyLocalizationRepository } from '../data/repositories/default-company-localization-repository';
export function useCompanyLocalizationUseCases(){return useMemo(()=>createCompanyLocalizationUseCases(new DefaultCompanyLocalizationRepository(companyLocalizationRemoteDataSource,()=>connectivityService.getSnapshot().isOnline)),[]);}
