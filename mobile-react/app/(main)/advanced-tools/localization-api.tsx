import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { LocalizationManagementScreen } from '@/src/features/platform-tools';

export default function LocalizationApiRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.localizationApi}>
      <LocalizationManagementScreen />
    </RouteGuard>
  );
}
