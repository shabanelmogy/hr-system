import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { OfflineOperationsPolicyScreen } from '@/src/platform/offline-operations';

export default function OfflineOperationsPolicyRoute() {
  return (
    <RouteGuard path={ROUTES.administration.offlineOperations}>
      <OfflineOperationsPolicyScreen />
    </RouteGuard>
  );
}
