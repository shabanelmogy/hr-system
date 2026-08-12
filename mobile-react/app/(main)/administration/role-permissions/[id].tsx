import { useLocalSearchParams } from 'expo-router';

import { ROUTES } from '@/src/core/constants/routes';
import { RolePermissionsScreen } from '@/src/features/administration/roles/permissions/screens/RolePermissionsScreen';
import { RouteGuard } from '@/src/features/auth';

export default function RolePermissionsRoute() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const roleId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  return (
    <RouteGuard path={ROUTES.administration.rolePermissions(roleId)}>
      <RolePermissionsScreen roleId={roleId} />
    </RouteGuard>
  );
}
