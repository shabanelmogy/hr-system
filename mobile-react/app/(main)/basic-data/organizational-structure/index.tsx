import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { OrganizationalStructureScreen } from '@/src/modules/hr/basic-data';

export default function OrganizationalStructureRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.organizationalStructure}>
      <OrganizationalStructureScreen />
    </RouteGuard>
  );
}
