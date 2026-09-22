import { Redirect } from 'expo-router';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { permissions, RouteGuard, useAuthorization } from '@/src/platform/auth';

export default function FinanceIndex() {
  const { allowed: canViewFiscalYears } = useAuthorization({ requiredPermissions: [permissions.ViewFiscalYears] });
  const destination = canViewFiscalYears ? ROUTES.finance.fiscalYears : ROUTES.finance.currencies;
  return <RouteGuard path={ROUTES.finance.root}><Redirect href={asHref(destination)} /></RouteGuard>;
}
