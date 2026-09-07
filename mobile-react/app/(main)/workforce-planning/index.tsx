import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { WorkforcePlanningOverviewScreen } from '@/src/features/workforce-planning';

export default function WorkforcePlanningOverviewRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.index}><WorkforcePlanningOverviewScreen /></RouteGuard>;
}
