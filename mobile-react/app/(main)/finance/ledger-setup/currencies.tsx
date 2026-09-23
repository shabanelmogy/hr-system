import { ROUTES } from '@/src/core/constants/routes';
import { CurrenciesScreen } from '@/src/modules/accounting/currencies';
import { RouteGuard } from '@/src/platform/auth';

export default function CurrenciesRoute() {
  return <RouteGuard path={ROUTES.finance.ledgerSetup.currencies}><CurrenciesScreen /></RouteGuard>;
}
