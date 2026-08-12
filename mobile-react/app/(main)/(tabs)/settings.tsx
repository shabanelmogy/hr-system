import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { SettingsScreen } from '@/src/features/settings/screens/SettingsScreen';

export default function SettingsRoute() {
  return (
    <RouteGuard path={ROUTES.settings}>
      <SettingsScreen />
    </RouteGuard>
  );
}
