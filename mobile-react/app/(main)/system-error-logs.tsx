import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { ErrorLogsScreen } from '@/src/platform/tools/error-logs';

export default function SystemErrorLogsRoute() {
  return <RouteGuard path={ROUTES.systemErrorLogs}><ErrorLogsScreen scope="system" /></RouteGuard>;
}
