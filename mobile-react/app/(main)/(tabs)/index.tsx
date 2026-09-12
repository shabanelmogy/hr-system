import { ROUTES } from '@/src/core/constants/routes';
import { useCanAccessRoute } from '@/src/platform/auth';
import { TenantDashboardScreen } from '@/src/platform/tenants';
import { ModuleLauncherScreen } from '@/src/platform/modules';

export default function HomeRoute() {
  const canViewSuperAdminDashboard = useCanAccessRoute(ROUTES.superAdminDashboard);

  return canViewSuperAdminDashboard ? <TenantDashboardScreen /> : <ModuleLauncherScreen />;
}
