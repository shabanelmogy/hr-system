import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { SettingsScreen } from '@/src/shell/settings';

export default function SettingsRoute() {
  return (
    <RouteGuard path={ROUTES.settings}>
      <SettingsScreen />
    </RouteGuard>
  );
}
