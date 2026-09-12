import { Redirect } from 'expo-router';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { UserManagementScreen } from '@/src/platform/administration';
import { permissions, RouteGuard, useAuthorization } from '@/src/platform/auth';

const viewUsersPermission = [permissions.ViewUsers] as const;
const manageOfflineOperationsPermission = [permissions.ManageOfflineOperations] as const;

export default function UserManagementRoute() {
  const { allowed: canViewUsers } = useAuthorization({
    requiredPermissions: viewUsersPermission,
  });
  const { allowed: canManageOfflineOperations } = useAuthorization({
    requiredPermissions: manageOfflineOperationsPermission,
  });

  return (
    <RouteGuard path={ROUTES.administration.root}>
      {canViewUsers
        ? <UserManagementScreen />
        : <Redirect href={asHref(
            canManageOfflineOperations
              ? ROUTES.administration.offlineOperations
              : ROUTES.administration.roles,
          )} />}
    </RouteGuard>
  );
}
