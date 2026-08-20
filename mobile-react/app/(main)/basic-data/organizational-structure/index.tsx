import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { OrganizationalStructureScreen } from '@/src/features/basic-data';

export default function OrganizationalStructureRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.organizationalStructure}>
      <OrganizationalStructureScreen />
    </RouteGuard>
  );
}
