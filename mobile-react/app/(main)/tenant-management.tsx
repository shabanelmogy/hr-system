import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { TenantManagementScreen } from '@/src/platform/tenants';

export default function TenantManagementRoute() {
  return (
    <RouteGuard path={ROUTES.tenantManagement}>
      <TenantManagementScreen />
    </RouteGuard>
  );
}
