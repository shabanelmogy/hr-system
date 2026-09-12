import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/platform/auth';
import { WorkforceBudgetsScreen } from '@/src/modules/hr/workforce-planning';

export default function WorkforceBudgetsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.budgets}><WorkforceBudgetsScreen /></RouteGuard>;
}
