import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { CostCentersScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function CostCentersRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureCostCenters}><CostCentersScreen /></RouteGuard>;
}
