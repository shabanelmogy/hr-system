import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { CompanyGeographicScopeScreen } from '@/src/platform/tenant-administration';

export default function CompanyGeographicScopeRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.companyGeographicScope}>
      <CompanyGeographicScopeScreen />
    </RouteGuard>
  );
}
