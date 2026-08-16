import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { HealthCheckScreen } from '@/src/features/platform-tools';

export default function HealthCheckRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.healthCheck}>
      <HealthCheckScreen />
    </RouteGuard>
  );
}
