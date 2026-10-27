import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { ErrorLogsScreen } from '@/src/platform/tools/error-logs';

export default function CompanyErrorLogsRoute() {
  return <RouteGuard path={ROUTES.advancedTools.errorLogs}><ErrorLogsScreen scope="company" /></RouteGuard>;
}
