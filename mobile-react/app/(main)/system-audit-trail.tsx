import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { AuditTrailScreen } from '@/src/platform/tools/audit-trail';
export default function SystemAuditTrailRoute() {
  return <RouteGuard path={ROUTES.systemAuditTrail}><AuditTrailScreen /></RouteGuard>;
}
