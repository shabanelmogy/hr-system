import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobLevelsScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function JobLevelsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobLevels}><JobLevelsScreen /></RouteGuard>;
}
