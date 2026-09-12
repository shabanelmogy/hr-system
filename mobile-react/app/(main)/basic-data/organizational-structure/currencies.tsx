import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { CurrenciesScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function CurrenciesRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureCurrencies}><CurrenciesScreen /></RouteGuard>;
}
