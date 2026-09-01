import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { PositionsScreen } from '@/src/features/basic-data/organizational-structure';

export default function PositionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructurePositions}><PositionsScreen /></RouteGuard>;
}
