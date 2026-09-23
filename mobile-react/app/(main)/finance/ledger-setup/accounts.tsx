import { ROUTES } from '@/src/core/constants/routes';
import { AccountsScreen } from '@/src/modules/accounting/ledger-setup';
import { RouteGuard } from '@/src/platform/auth';
export default function AccountsRoute() { return <RouteGuard path={ROUTES.finance.ledgerSetup.accounts}><AccountsScreen /></RouteGuard>; }
