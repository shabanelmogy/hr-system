import { ROUTES } from '@/src/core/constants/routes';
import { ProfileScreen, RouteGuard } from '@/src/platform/auth';

export default function ProfileRoute() {
  return (
    <RouteGuard path={ROUTES.profile}>
      <ProfileScreen />
    </RouteGuard>
  );
}
