import { ROUTES } from '@/src/core/constants/routes';
import { InvitationManagementScreen } from '@/src/platform/administration';
import { RouteGuard } from '@/src/platform/auth';

export default function InvitationManagementRoute() {
  return (
    <RouteGuard path={ROUTES.administration.invitations}>
      <InvitationManagementScreen />
    </RouteGuard>
  );
}
