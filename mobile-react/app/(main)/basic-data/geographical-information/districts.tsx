import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { DistrictsScreen } from '@/src/modules/reference-data/geography';

export default function DistrictsRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.districts}>
      <DistrictsScreen />
    </RouteGuard>
  );
}
