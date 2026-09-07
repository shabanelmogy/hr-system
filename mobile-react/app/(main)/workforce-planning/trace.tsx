import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { WorkforceTraceScreen } from '@/src/features/workforce-planning';

export default function WorkforceTraceRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.trace}><WorkforceTraceScreen /></RouteGuard>;
}
