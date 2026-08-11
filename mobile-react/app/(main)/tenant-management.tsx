import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { TenantManagementScreen } from '@/src/features/tenants';

export default function TenantManagementRoute() {
  return (
    <RouteGuard path={ROUTES.tenantManagement}>
      <TenantManagementScreen />
    </RouteGuard>
  );
}
