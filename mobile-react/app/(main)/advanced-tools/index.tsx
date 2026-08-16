import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { PlatformToolsOverviewScreen } from '@/src/features/platform-tools';

export default function AdvancedToolsRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.root}>
      <PlatformToolsOverviewScreen moduleId="advancedTools" />
    </RouteGuard>
  );
}
