import { Redirect } from 'expo-router';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { UserManagementScreen } from '@/src/features/administration';
import { permissions, RouteGuard, useAuthorization } from '@/src/features/auth';

const viewUsersPermission = [permissions.ViewUsers] as const;

export default function UserManagementRoute() {
  const { allowed: canViewUsers } = useAuthorization({
    requiredPermissions: viewUsersPermission,
  });

  return (
    <RouteGuard path={ROUTES.administration.root}>
      {canViewUsers
        ? <UserManagementScreen />
        : <Redirect href={asHref(ROUTES.administration.roles)} />}
    </RouteGuard>
  );
}
