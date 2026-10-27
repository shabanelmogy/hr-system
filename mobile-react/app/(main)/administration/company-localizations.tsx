import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { CompanyLocalizationsScreen } from '@/src/platform/tenant-administration/company-localizations';

export default function CompanyLocalizationsRoute() {
  return <RouteGuard path={ROUTES.administration.companyLocalizations}><CompanyLocalizationsScreen /></RouteGuard>;
}
