import { useQuery } from '@tanstack/react-query';

import { useOperationsUseCases } from '../../composition/use-operations-use-cases';

export const operationsKeys = {
  health: ['platform-tools', 'health'] as const,
  backgroundJobs: ['platform-tools', 'background-jobs'] as const,
};

export function useHealthCheck() {
  const useCases = useOperationsUseCases();
  return useQuery({
    queryKey: operationsKeys.health,
    queryFn: () => useCases.getHealthCheck(),
    refetchInterval: 30_000,
  });
}

export function useBackgroundJobs() {
  const useCases = useOperationsUseCases();
  return useQuery({
    queryKey: operationsKeys.backgroundJobs,
    queryFn: () => useCases.getBackgroundJobs(),
    refetchInterval: 15_000,
  });
}
