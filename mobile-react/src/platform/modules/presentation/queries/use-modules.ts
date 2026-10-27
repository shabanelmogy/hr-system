import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/platform/auth';
import { canAccessRoute } from '@/src/platform/auth/rbac';
import { getAdministrationModule } from '../../registry/administration-launcher';
import type { ErpModule } from '../../domain/models/module';
import { useQuery } from '@tanstack/react-query';
import { intersectModulesWithMobileRegistry } from '../../registry';
import { useModuleUseCases } from '../../composition/use-module-use-cases';

export const moduleKeys = {
  all: ['modules'] as const,
  accessible: () => [...moduleKeys.all, 'accessible'] as const,
  installed: () => [...moduleKeys.all, 'installed'] as const,
  tenantEntitlements: () => [...moduleKeys.all, 'tenant-entitlements'] as const,
};

export const useAccessibleModules = (enabled = true) => {
  const useCases = useModuleUseCases();
  const { session } = useAuth();
  const { t } = useTranslation();
  const select = useCallback((modules: ErpModule[]) => {
    const administration = session ? getAdministrationModule(
      path => canAccessRoute(path, session), permission => session.permissions.includes(permission), key => t(key),
    ) : null;
    return administration ? [...modules, administration] : modules;
  }, [session, t]);
  return useQuery({
    queryKey: moduleKeys.accessible(),
    queryFn: async () => intersectModulesWithMobileRegistry(await useCases.getAccessible()),
    select,
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

export const useTenantEntitlementModules = (enabled = true) => {
  const useCases = useModuleUseCases();
  return useQuery({
    queryKey: moduleKeys.tenantEntitlements(),
    queryFn: useCases.getTenantEntitlements,
    enabled,
    staleTime: 300_000,
    networkMode: 'always',
  });
};
