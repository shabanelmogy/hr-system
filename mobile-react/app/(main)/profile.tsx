import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { ProfileScreen } from '@/src/features/auth/profile';

export default function ProfileRoute() {
  return (
    <RouteGuard path={ROUTES.profile}>
      <ProfileScreen />
    </RouteGuard>
  );
}
