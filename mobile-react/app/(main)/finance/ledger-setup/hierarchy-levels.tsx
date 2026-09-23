import { ROUTES } from '@/src/core/constants/routes';
import { HierarchyLevelsScreen } from '@/src/modules/accounting/ledger-setup';
import { RouteGuard } from '@/src/platform/auth';
export default function HierarchyLevelsRoute() { return <RouteGuard path={ROUTES.finance.ledgerSetup.hierarchyLevels}><HierarchyLevelsScreen /></RouteGuard>; }
