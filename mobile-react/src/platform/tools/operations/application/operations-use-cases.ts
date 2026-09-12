import type { OperationsRepository } from '../domain/repositories/operations-repository';

export type OperationsUseCases = OperationsRepository;

export function createOperationsUseCases(repository: OperationsRepository): OperationsUseCases {
  return {
    getHealthCheck: () => repository.getHealthCheck(),
    getBackgroundJobs: () => repository.getBackgroundJobs(),
    getSwaggerUrl: () => repository.getSwaggerUrl(),
    getHangfireUrl: () => repository.getHangfireUrl(),
  };
}
