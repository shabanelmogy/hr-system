import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { HangfireDashboardScreen } from '@/src/features/platform-tools/operations';

export default function HangfireDashboardRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.hangfireDashboard}>
      <HangfireDashboardScreen />
    </RouteGuard>
  );
}
