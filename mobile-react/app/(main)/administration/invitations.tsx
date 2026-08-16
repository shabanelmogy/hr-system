import { ROUTES } from '@/src/core/constants/routes';
import { InvitationManagementScreen } from '@/src/features/administration';
import { RouteGuard } from '@/src/features/auth';

export default function InvitationManagementRoute() {
  return (
    <RouteGuard path={ROUTES.administration.invitations}>
      <InvitationManagementScreen />
    </RouteGuard>
  );
}
