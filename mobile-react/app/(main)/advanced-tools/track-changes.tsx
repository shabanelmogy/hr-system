import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { TrackChangesScreen } from '@/src/features/platform-tools';

export default function TrackChangesRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.trackChanges}>
      <TrackChangesScreen />
    </RouteGuard>
  );
}
