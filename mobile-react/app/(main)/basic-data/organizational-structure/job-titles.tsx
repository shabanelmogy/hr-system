import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobTitlesScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function JobTitlesRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobTitles}><JobTitlesScreen /></RouteGuard>;
}
