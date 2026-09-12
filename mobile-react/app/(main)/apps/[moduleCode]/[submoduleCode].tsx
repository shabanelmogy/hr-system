import { useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/src/core/constants/routes';
import { canAccessRoute, RouteGuard, useAuth } from '@/src/platform/auth';
import { SubmoduleEntryScreen } from '@/src/platform/modules';
import { useCallback } from 'react';

export default function SubmoduleRoute() {
  const { moduleCode, submoduleCode } = useLocalSearchParams<{
    moduleCode: string;
    submoduleCode: string;
  }>();
  const module = moduleCode ?? '';
  const submodule = submoduleCode ?? '';
  const { session } = useAuth();
  const canAccess = useCallback(
    (path: Parameters<typeof canAccessRoute>[0]) => canAccessRoute(path, session),
    [session],
  );

  return (
    <RouteGuard path={ROUTES.submodule(module, submodule)}>
      <SubmoduleEntryScreen
        moduleCode={module}
        submoduleCode={submodule}
        canAccess={canAccess}
      />
    </RouteGuard>
  );
}
