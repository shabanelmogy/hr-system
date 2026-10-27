import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { ErrorLogSettingsScreen } from '@/src/platform/tools/error-logs';

export default function ErrorLogSettingsRoute() {
  return <RouteGuard path={ROUTES.errorLogSettings}><ErrorLogSettingsScreen /></RouteGuard>;
}
