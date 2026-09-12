import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { EnvelopeAmendmentsScreen } from '@/src/modules/hr/workforce-planning';

export default function EnvelopeAmendmentsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.envelopeAmendments}><EnvelopeAmendmentsScreen /></RouteGuard>;
}
