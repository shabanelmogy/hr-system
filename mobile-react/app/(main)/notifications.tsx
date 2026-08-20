import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { NotificationsScreen } from '@/src/features/notifications';

export default function NotificationsRoute() {
  return (
    <RouteGuard path={ROUTES.notifications}>
      <NotificationsScreen />
    </RouteGuard>
  );
}
