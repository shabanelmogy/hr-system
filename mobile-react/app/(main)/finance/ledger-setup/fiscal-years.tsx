import { ROUTES } from '@/src/core/constants/routes';
import { FiscalYearsScreen } from '@/src/modules/accounting/fiscal-years';
import { RouteGuard } from '@/src/platform/auth';

export default function FiscalYearsRoute() {
  return (
    <RouteGuard path={ROUTES.finance.ledgerSetup.fiscalYears}>
      <FiscalYearsScreen />
    </RouteGuard>
  );
}
