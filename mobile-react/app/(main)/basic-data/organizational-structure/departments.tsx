import { RouteGuard } from '@/src/platform/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { DepartmentsScreen } from '@/src/modules/hr/basic-data/organizational-structure';

export default function DepartmentsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureDepartments}><DepartmentsScreen /></RouteGuard>;
}
