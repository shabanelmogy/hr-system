import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { AddressTypesScreen } from '@/src/modules/reference-data/addresses';

export default function AddressTypesRoute() {
  return <RouteGuard path={ROUTES.basicData.addressTypes}><AddressTypesScreen /></RouteGuard>;
}
