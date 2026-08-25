import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { DistrictsScreen } from '@/src/features/basic-data';

export default function DistrictsRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.districts}>
      <DistrictsScreen />
    </RouteGuard>
  );
}
