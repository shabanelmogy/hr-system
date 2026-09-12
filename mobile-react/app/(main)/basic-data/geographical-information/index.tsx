import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { GeographicalInformationScreen } from '@/src/modules/hr/basic-data';

export default function GeographicalInformationRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.geographicalInformation}>
      <GeographicalInformationScreen />
    </RouteGuard>
  );
}
