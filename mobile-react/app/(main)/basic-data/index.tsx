import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { BasicDataOverviewScreen } from '@/src/features/basic-data';

export default function BasicDataOverviewRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.root}>
      <BasicDataOverviewScreen />
    </RouteGuard>
  );
}
