import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { BranchesScreen } from '@/src/features/basic-data/organizational-structure';

export default function BranchesRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureBranches}><BranchesScreen /></RouteGuard>;
}
