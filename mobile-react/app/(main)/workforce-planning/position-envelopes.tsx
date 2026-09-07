import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { PositionEnvelopesScreen } from '@/src/features/workforce-planning';

export default function PositionEnvelopesRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.positionEnvelopes}><PositionEnvelopesScreen /></RouteGuard>;
}
