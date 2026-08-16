import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { ApiEndpointsScreen } from '@/src/features/platform-tools';

export default function ApiEndpointsRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.apiEndpoints}>
      <ApiEndpointsScreen />
    </RouteGuard>
  );
}
