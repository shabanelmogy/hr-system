import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { BranchesScreen } from '@/src/features/basic-data/organizational-structure';

export default function OrganizationalStructureManagementRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureManagement}><BranchesScreen /></RouteGuard>;
}
