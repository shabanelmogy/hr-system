import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { HangfireDashboardScreen } from '@/src/platform/tools/operations';

export default function HangfireDashboardRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.hangfireDashboard}>
      <HangfireDashboardScreen />
    </RouteGuard>
  );
}
