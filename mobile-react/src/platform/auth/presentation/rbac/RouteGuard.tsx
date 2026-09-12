import type { PropsWithChildren } from 'react';

import { AccessDeniedScreen } from '@/src/platform/auth/presentation/rbac/AccessDeniedScreen';
import { useAuth } from '@/src/platform/auth/presentation/context/AuthProvider';
import { canAccessRoute, requiredModuleForPath } from '@/src/platform/auth/presentation/rbac/route-access';
import { useAccessibleModules } from '@/src/platform/modules';
import { AppScreen, AppStateView } from '@/src/shared/components';

type RouteGuardProps = PropsWithChildren<{ path: string }>;

export function RouteGuard({ children, path }: RouteGuardProps) {
  const { session, status } = useAuth();
  const moduleRequirement = requiredModuleForPath(path);
  const modulesQuery = useAccessibleModules(Boolean(moduleRequirement));

  if (status === 'loading') {
    return (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView state="loading" />
      </AppScreen>
    );
  }

  if (!canAccessRoute(path, session)) return <AccessDeniedScreen />;
  if (moduleRequirement && modulesQuery.isLoading) {
    return <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}><AppStateView state="loading" /></AppScreen>;
  }
  if (moduleRequirement && (modulesQuery.isError || !modulesQuery.data?.some(item => item.code.toLowerCase() === moduleRequirement.moduleCode.toLowerCase() && (!moduleRequirement.submoduleCode || item.submodules.some(submodule => submodule.code.toLowerCase() === moduleRequirement.submoduleCode!.toLowerCase()))))) return <AccessDeniedScreen />;
  return <>{children}</>;
}

