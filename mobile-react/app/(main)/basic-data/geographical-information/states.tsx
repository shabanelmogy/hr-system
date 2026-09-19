import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { StatesScreen } from '@/src/modules/reference-data/geography';

export default function StatesRoute() {
  return <RouteGuard path={ROUTES.basicData.states}><StatesScreen /></RouteGuard>;
}
