import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { AddressTypesScreen } from '@/src/features/basic-data';

export default function AddressTypesRoute() {
  return <RouteGuard path={ROUTES.basicData.addressTypes}><AddressTypesScreen /></RouteGuard>;
}
