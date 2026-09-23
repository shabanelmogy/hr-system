import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { LedgerSetupOverviewScreen } from '@/src/modules/accounting/ledger-setup';

export default function FinanceIndex() {
  return <RouteGuard path={ROUTES.finance.root}><LedgerSetupOverviewScreen /></RouteGuard>;
}
