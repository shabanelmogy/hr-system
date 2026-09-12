import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { DivisionsScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function DivisionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureDivisions}><DivisionsScreen /></RouteGuard>;
}
