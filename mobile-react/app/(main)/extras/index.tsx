import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { PlatformToolsOverviewScreen } from '@/src/platform/tools/navigation';

export default function ExtrasRoute() {
  return (
    <RouteGuard path={ROUTES.extras.root}>
      <PlatformToolsOverviewScreen moduleId="extras" />
    </RouteGuard>
  );
}
