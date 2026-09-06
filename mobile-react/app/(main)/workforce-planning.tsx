import { WorkforcePlansScreen } from '@/src/features/workforce-planning';
import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';

export default function WorkforcePlanningRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning}><WorkforcePlansScreen /></RouteGuard>;
}
