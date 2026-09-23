import { ROUTES } from '@/src/core/constants/routes';
import { LedgerSetupResourceScreen } from '@/src/modules/accounting/ledger-setup';
import { RouteGuard } from '@/src/platform/auth';
export default function DimensionsRoute() { return <RouteGuard path={ROUTES.finance.ledgerSetup.dimensions}><LedgerSetupResourceScreen resource="dimensions" /></RouteGuard>; }
