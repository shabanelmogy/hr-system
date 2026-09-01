import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobDescriptionsScreen } from '@/src/features/basic-data/organizational-structure';

export default function JobDescriptionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobDescriptions}><JobDescriptionsScreen /></RouteGuard>;
}
