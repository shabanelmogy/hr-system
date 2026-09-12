import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { BranchesScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function OrganizationalStructureManagementRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureManagement}><BranchesScreen /></RouteGuard>;
}
