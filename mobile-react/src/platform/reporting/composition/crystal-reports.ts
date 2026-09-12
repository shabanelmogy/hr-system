import { connectivityService } from '@/src/core/offline';

import { createCrystalReportUseCases } from '../application/crystal-report-use-cases';
import { crystalReportRemoteDataSource } from '../data/remote/crystal-report-remote-data-source';
import { DefaultCrystalReportRepository } from '../data/repositories/default-crystal-report-repository';

const crystalReportRepository = new DefaultCrystalReportRepository(
  crystalReportRemoteDataSource,
  () => connectivityService.getSnapshot().isOnline,
);

export const crystalReportsApi = createCrystalReportUseCases(crystalReportRepository);
