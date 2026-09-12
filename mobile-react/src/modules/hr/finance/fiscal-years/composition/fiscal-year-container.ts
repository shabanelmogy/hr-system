import { createFiscalYearUseCases } from '../application/fiscal-year-use-cases';
import { fiscalYearRemoteDataSource } from '../data/remote/fiscal-year-remote-data-source';
import { DefaultFiscalYearRepository } from '../data/repositories/default-fiscal-year-repository';

export const fiscalYearRepository = new DefaultFiscalYearRepository(fiscalYearRemoteDataSource);
export const fiscalYearUseCases = createFiscalYearUseCases(fiscalYearRepository);
