import { useQuery } from '@tanstack/react-query';
import { intersectModulesWithMobileRegistry } from '../../registry';
import { useModuleUseCases } from '../../composition/use-module-use-cases';

export const moduleKeys = {
  all: ['modules'] as const,
  accessible: () => [...moduleKeys.all, 'accessible'] as const,
  installed: () => [...moduleKeys.all, 'installed'] as const,
};

export const useAccessibleModules = (enabled = true) => {
  const useCases = useModuleUseCases();
  return useQuery({
    queryKey: moduleKeys.accessible(),
    queryFn: async () => intersectModulesWithMobileRegistry(await useCases.getAccessible()),
    enabled,
    staleTime: 30_000,
    networkMode: 'always',
  });
};

export const useInstalledModules = (enabled = true) => {
  const useCases = useModuleUseCases();
  return useQuery({
    queryKey: moduleKeys.installed(),
    queryFn: async () => intersectModulesWithMobileRegistry(await useCases.getInstalled()),
    enabled,
    staleTime: 300_000,
    networkMode: 'always',
  });
};