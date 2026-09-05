import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { FiscalYearsScreen } from '@/src/features/finance/fiscal-years';

export default function FiscalYearsRoute() {
  return <RouteGuard path={ROUTES.finance.fiscalYears}><FiscalYearsScreen /></RouteGuard>;
}
