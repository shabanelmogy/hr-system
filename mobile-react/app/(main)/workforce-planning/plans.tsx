import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { WorkforcePlansScreen } from '@/src/features/workforce-planning';

export default function WorkforcePlansRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.plans}><WorkforcePlansScreen /></RouteGuard>;
}
