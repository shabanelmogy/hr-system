import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { PlatformToolsOverviewScreen } from '@/src/features/platform-tools';

export default function ExtrasRoute() {
  return (
    <RouteGuard path={ROUTES.extras.root}>
      <PlatformToolsOverviewScreen moduleId="extras" />
    </RouteGuard>
  );
}
