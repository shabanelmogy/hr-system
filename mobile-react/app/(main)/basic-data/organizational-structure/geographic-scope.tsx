import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { CompanyGeographicScopeScreen } from '@/src/features/basic-data';

export default function CompanyGeographicScopeRoute() {
  return (
    <RouteGuard path={ROUTES.basicData.companyGeographicScope}>
      <CompanyGeographicScopeScreen />
    </RouteGuard>
  );
}
