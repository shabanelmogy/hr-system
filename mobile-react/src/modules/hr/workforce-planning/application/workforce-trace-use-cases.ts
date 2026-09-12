import type { WorkforceTraceRepository } from '../domain/repositories/workforce-trace-repository';
export type WorkforceTraceUseCases = WorkforceTraceRepository;
export const createWorkforceTraceUseCases = (repository: WorkforceTraceRepository): WorkforceTraceUseCases => ({
  byApplication: (id) => repository.byApplication(id), byOffer: (id) => repository.byOffer(id), byEmployee: (id) => repository.byEmployee(id), commitment: (query) => repository.commitment(query),
});
