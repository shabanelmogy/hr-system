import { ROUTES } from '@/src/core/constants/routes';
import { LedgerSetupOverviewScreen } from '@/src/modules/accounting/ledger-setup';
import { RouteGuard } from '@/src/platform/auth';

export default function LedgerSetupIndex() {
  return <RouteGuard path={ROUTES.finance.ledgerSetup.root}><LedgerSetupOverviewScreen /></RouteGuard>;
}
