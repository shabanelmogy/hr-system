import { useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { ModuleLauncherScreen } from '@/src/platform/modules';

export default function ModuleRoute() {
  const { moduleCode } = useLocalSearchParams<{ moduleCode: string }>();
  const code = moduleCode ?? '';
  return (
    <RouteGuard path={ROUTES.module(code)}>
      <ModuleLauncherScreen moduleCode={code} />
    </RouteGuard>
  );
}
