import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { PlatformToolsOverviewScreen } from '@/src/platform/tools/navigation';

export default function AdvancedToolsRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.root}>
      <PlatformToolsOverviewScreen moduleId="advancedTools" />
    </RouteGuard>
  );
}
