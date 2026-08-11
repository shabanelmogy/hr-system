import { ROUTES } from '@/src/core/constants/routes';
import { useCanAccessRoute } from '@/src/features/auth';
import { HomeScreen } from '@/src/features/home/screens/HomeScreen';
import { TenantDashboardScreen } from '@/src/features/tenants';

export default function HomeRoute() {
  const canViewSuperAdminDashboard = useCanAccessRoute(ROUTES.superAdminDashboard);

  return canViewSuperAdminDashboard ? <TenantDashboardScreen /> : <HomeScreen />;
}
