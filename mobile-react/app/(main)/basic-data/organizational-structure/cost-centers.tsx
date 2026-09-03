import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { CostCentersScreen } from '@/src/features/basic-data/organizational-structure';

export default function CostCentersRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureCostCenters}><CostCentersScreen /></RouteGuard>;
}
