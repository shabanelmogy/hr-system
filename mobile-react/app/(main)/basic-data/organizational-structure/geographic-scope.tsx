import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { CompanyGeographicScopeScreen } from '@/src/modules/hr/basic-data';

export default function CompanyGeographicScopeRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.companyGeographicScope}>
      <CompanyGeographicScopeScreen />
    </RouteGuard>
  );
}
