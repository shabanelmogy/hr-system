import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { ApiEndpointsScreen } from '@/src/platform/tools/operations';

export default function ApiEndpointsRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.apiEndpoints}>
      <ApiEndpointsScreen />
    </RouteGuard>
  );
}
