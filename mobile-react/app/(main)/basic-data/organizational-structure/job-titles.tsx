import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { JobTitlesScreen } from '@/src/features/basic-data/organizational-structure';

export default function JobTitlesRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureJobTitles}><JobTitlesScreen /></RouteGuard>;
}
