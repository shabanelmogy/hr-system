import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobDescriptionsScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function JobDescriptionsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobDescriptions}><JobDescriptionsScreen /></RouteGuard>;
}
