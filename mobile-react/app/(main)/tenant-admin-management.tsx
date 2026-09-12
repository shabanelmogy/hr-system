import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { TenantAdminManagementScreen } from '@/src/platform/tenant-admins';

export default function TenantAdminManagementRoute() {
  return (
    <RouteGuard path={ROUTES.tenantAdminManagement}>
      <TenantAdminManagementScreen />
    </RouteGuard>
  );
}
