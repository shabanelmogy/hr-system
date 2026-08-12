import type { PropsWithChildren } from 'react';

import { AccessDeniedScreen } from '@/src/features/auth/rbac/AccessDeniedScreen';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import { canAccessRoute } from '@/src/features/auth/rbac/route-access';
import { AppScreen, AppStateView } from '@/src/shared/components';

type RouteGuardProps = PropsWithChildren<{ path: string }>;

export function RouteGuard({ children, path }: RouteGuardProps) {
  const { session, status } = useAuth();

  if (status === 'loading') {
    return (
      <AppScreen contentContainerStyle={{ flex: 1 }} scroll={false}>
        <AppStateView state="loading" />
      </AppScreen>
    );
  }

  if (!canAccessRoute(path, session)) return <AccessDeniedScreen />;
  return <>{children}</>;
}
