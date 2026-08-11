import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { TenantDashboardScreen } from '@/src/features/tenants';

export default function SuperAdminDashboardRoute() {
  return (
    <RouteGuard path={ROUTES.superAdminDashboard}>
      <TenantDashboardScreen />
    </RouteGuard>
  );
}
