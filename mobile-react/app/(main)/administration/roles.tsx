import { ROUTES } from '@/src/core/constants/routes';
import { RoleManagementScreen } from '@/src/platform/administration';
import { RouteGuard } from '@/src/platform/auth';

export default function RoleManagementRoute() {
  return (
    <RouteGuard path={ROUTES.administration.roles}>
      <RoleManagementScreen />
    </RouteGuard>
  );
}
