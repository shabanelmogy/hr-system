import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { CountriesScreen } from '@/src/features/basic-data';

export default function CountriesRoute() {
  return <RouteGuard path={ROUTES.basicData.countries}><CountriesScreen /></RouteGuard>;
}
