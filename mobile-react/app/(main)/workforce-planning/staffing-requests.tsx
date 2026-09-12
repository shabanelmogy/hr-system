import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { StaffingRequestsScreen } from '@/src/modules/hr/workforce-planning';

export default function StaffingRequestsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.staffingRequests}><StaffingRequestsScreen /></RouteGuard>;
}
