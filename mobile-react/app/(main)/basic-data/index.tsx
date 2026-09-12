import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { BasicDataOverviewScreen } from '@/src/modules/hr/basic-data';

export default function BasicDataOverviewRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.root}>
      <BasicDataOverviewScreen />
    </RouteGuard>
  );
}
