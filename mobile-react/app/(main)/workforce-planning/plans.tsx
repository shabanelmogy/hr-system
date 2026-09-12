import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { WorkforcePlansScreen } from '@/src/modules/hr/workforce-planning';

export default function WorkforcePlansRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.plans}><WorkforcePlansScreen /></RouteGuard>;
}
