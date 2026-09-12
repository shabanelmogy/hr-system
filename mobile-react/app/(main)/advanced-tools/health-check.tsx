import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { HealthCheckScreen } from '@/src/platform/tools/operations';

export default function HealthCheckRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.healthCheck}>
      <HealthCheckScreen />
    </RouteGuard>
  );
}
