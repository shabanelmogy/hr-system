import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { StaffingRequestsScreen } from '@/src/features/workforce-planning';

export default function StaffingRequestsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.staffingRequests}><StaffingRequestsScreen /></RouteGuard>;
}
