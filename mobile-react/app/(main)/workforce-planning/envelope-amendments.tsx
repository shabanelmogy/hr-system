import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { EnvelopeAmendmentsScreen } from '@/src/features/workforce-planning';

export default function EnvelopeAmendmentsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.envelopeAmendments}><EnvelopeAmendmentsScreen /></RouteGuard>;
}
