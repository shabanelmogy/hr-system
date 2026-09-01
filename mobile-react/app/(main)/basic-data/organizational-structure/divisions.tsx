import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { DivisionsScreen } from '@/src/features/basic-data/organizational-structure';

export default function DivisionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureDivisions}><DivisionsScreen /></RouteGuard>;
}
