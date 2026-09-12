import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { TenantDashboardScreen } from '@/src/platform/tenants';

export default function SuperAdminDashboardRoute() {
  return (
    <RouteGuard path={ROUTES.superAdminDashboard}>
      <TenantDashboardScreen />
    </RouteGuard>
  );
}
