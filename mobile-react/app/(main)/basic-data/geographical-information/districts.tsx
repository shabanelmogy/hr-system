import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { DistrictsScreen } from '@/src/modules/hr/basic-data';

export default function DistrictsRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.districts}>
      <DistrictsScreen />
    </RouteGuard>
  );
}
