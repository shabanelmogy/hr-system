import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { WorkforcePlanningOverviewScreen } from '@/src/modules/hr/workforce-planning';

export default function WorkforcePlanningOverviewRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.index}><WorkforcePlanningOverviewScreen /></RouteGuard>;
}
