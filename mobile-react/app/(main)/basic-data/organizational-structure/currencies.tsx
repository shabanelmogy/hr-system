import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { CurrenciesScreen } from '@/src/features/basic-data/organizational-structure';

export default function CurrenciesRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureCurrencies}><CurrenciesScreen /></RouteGuard>;
}
