import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { GeographicalInformationScreen } from '@/src/features/basic-data';

export default function GeographicalInformationRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.geographicalInformation}>
      <GeographicalInformationScreen />
    </RouteGuard>
  );
}
