import { RouteGuard } from '@/src/platform/auth';
import { ModuleLauncherScreen } from '@/src/platform/modules';
import { ROUTES } from '@/src/core/constants/routes';

export default function AppsRoute() {
  return <RouteGuard path={ROUTES.apps}><ModuleLauncherScreen /></RouteGuard>;
}
