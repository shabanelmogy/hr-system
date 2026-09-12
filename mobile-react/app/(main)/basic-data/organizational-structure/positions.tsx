import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { PositionsScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function PositionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructurePositions}><PositionsScreen /></RouteGuard>;
}
