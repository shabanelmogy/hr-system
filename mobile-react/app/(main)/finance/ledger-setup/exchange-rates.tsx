import { ROUTES } from '@/src/core/constants/routes';
import { LedgerSetupResourceScreen } from '@/src/modules/accounting/ledger-setup';
import { RouteGuard } from '@/src/platform/auth';
export default function ExchangeRatesRoute() { return <RouteGuard path={ROUTES.finance.ledgerSetup.exchangeRates}><LedgerSetupResourceScreen resource="exchange-rates" /></RouteGuard>; }
