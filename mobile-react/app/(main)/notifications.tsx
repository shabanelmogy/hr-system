import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { NotificationsScreen } from '@/src/platform/notifications';

export default function NotificationsRoute() {
  return (
    <RouteGuard path={ROUTES.notifications}>
      <NotificationsScreen />
    </RouteGuard>
  );
}
