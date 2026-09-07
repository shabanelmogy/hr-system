import { ROUTES } from '@/src/core/constants/routes';
import { RouteGuard } from '@/src/features/auth';
import { WorkforceBudgetsScreen } from '@/src/features/workforce-planning';

export default function WorkforceBudgetsRoute() {
  return <RouteGuard path={ROUTES.workforcePlanning.budgets}><WorkforceBudgetsScreen /></RouteGuard>;
}
