import { Redirect } from 'expo-router';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { UserManagementScreen } from '@/src/platform/administration';
import { permissions, RouteGuard, useAuthorization } from '@/src/platform/auth';

const viewUsersPermission = [permissions.ViewUsers] as const;
const viewOfflineOperationsPermission = [permissions.ViewOfflineOperations] as const;
const viewCompanyLocalizationsPermission = [permissions.ViewCompanyLocalizations] as const;
const viewRolesPermission = [permissions.ViewRoles] as const;

export default function UserManagementRoute() {
  const { allowed: canViewUsers } = useAuthorization({
    requiredPermissions: viewUsersPermission,
  });
  const { allowed: canViewOfflineOperations } = useAuthorization({
    requiredPermissions: viewOfflineOperationsPermission,
  });
  const { allowed: canViewCompanyLocalizations } = useAuthorization({ requiredPermissions: viewCompanyLocalizationsPermission });
  const { allowed: canViewRoles } = useAuthorization({ requiredPermissions: viewRolesPermission });

  return (
    <RouteGuard path={ROUTES.administration.root}>
      {canViewUsers
        ? <UserManagementScreen />
        : <Redirect href={asHref(
            canViewOfflineOperations
              ? ROUTES.administration.offlineOperations
              : canViewCompanyLocalizations
                ? ROUTES.administration.companyLocalizations
                : canViewRoles ? ROUTES.administration.roles : ROUTES.administration.invitations,
          )} />}
    </RouteGuard>
  );
}
