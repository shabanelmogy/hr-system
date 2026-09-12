import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { TrackChangesScreen } from '@/src/platform/tools/track-changes';

export default function TrackChangesRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.trackChanges}>
      <TrackChangesScreen />
    </RouteGuard>
  );
}
