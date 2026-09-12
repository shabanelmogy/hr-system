import { createOperationsUseCases } from '../application/operations-use-cases';
import { DefaultOperationsRepository } from '../data/repositories/default-operations-repository';

const operationsUseCases = createOperationsUseCases(new DefaultOperationsRepository());

export function useOperationsUseCases() {
  return operationsUseCases;
}
