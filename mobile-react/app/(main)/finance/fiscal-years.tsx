import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { FiscalYearsScreen } from '@/src/modules/hr/finance/fiscal-years';

export default function FiscalYearsRoute() {
  return <RouteGuard path={ROUTES.finance.fiscalYears}><FiscalYearsScreen /></RouteGuard>;
}
