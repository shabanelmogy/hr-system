import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { WorkforceTraceScreen } from '@/src/modules/hr/workforce-planning';

export default function WorkforceTraceRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.trace}><WorkforceTraceScreen /></RouteGuard>;
}
