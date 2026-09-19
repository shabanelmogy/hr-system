import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { CountriesScreen } from '@/src/modules/reference-data/geography';

export default function CountriesRoute() {
  return <RouteGuard path={ROUTES.basicData.countries}><CountriesScreen /></RouteGuard>;
}
