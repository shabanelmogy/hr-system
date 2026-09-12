import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { PositionEnvelopesScreen } from '@/src/modules/hr/workforce-planning';

export default function PositionEnvelopesRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.positionEnvelopes}><PositionEnvelopesScreen /></RouteGuard>;
}
