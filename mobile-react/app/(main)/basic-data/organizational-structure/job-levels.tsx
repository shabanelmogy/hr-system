import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobLevelsScreen } from '@/src/features/basic-data/organizational-structure';

export default function JobLevelsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobLevels}><JobLevelsScreen /></RouteGuard>;
}
