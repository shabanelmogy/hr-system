import { ROUTES } from '@/src/core/constants/routes';
import { RoleManagementScreen } from '@/src/features/administration';
import { RouteGuard } from '@/src/features/auth';

export default function RoleManagementRoute() {
  return (
    <RouteGuard path={ROUTES.administration.roles}>
      <RoleManagementScreen />
    </RouteGuard>
  );
}
