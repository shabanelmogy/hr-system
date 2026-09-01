import { RouteGuard } from '@/src/features/auth';
import { ROUTES } from '@/src/core/constants/routes';
import { DepartmentsScreen } from '@/src/features/basic-data/organizational-structure';

export default function DepartmentsRoute() {
  return <RouteGuard path={ROUTES.basicData.organizationalStructureDepartments}><DepartmentsScreen /></RouteGuard>;
}
