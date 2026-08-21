import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { StatesScreen } from '@/src/features/basic-data';

export default function StatesRoute() {
  return <RouteGuard path={ROUTES.basicData.states}><StatesScreen /></RouteGuard>;
}
