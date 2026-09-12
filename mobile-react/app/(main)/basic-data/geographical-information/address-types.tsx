import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { AddressTypesScreen } from '@/src/modules/hr/basic-data';

export default function AddressTypesRoute() {
  return <RouteGuard path={ROUTES.basicData.addressTypes}><AddressTypesScreen /></RouteGuard>;
}
