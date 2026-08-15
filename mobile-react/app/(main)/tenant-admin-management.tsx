import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { TenantAdminManagementScreen } from '@/src/features/tenant-admins';

export default function TenantAdminManagementRoute() {
  return (
    <RouteGuard path={ROUTES.tenantAdminManagement}>
      <TenantAdminManagementScreen />
    </RouteGuard>
  );
}
