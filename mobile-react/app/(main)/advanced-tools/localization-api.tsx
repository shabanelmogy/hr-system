import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { LocalizationManagementScreen } from '@/src/platform/tools/localization';

export default function LocalizationApiRoute() {
  return (
    <RouteGuard path={ROUTES.advancedTools.localizationApi}>
      <LocalizationManagementScreen />
    </RouteGuard>
  );
}
