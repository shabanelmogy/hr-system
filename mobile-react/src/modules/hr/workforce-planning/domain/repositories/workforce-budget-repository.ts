import type { WorkforcePlanningPage } from '../models/page';
import type {
  BudgetSourcePlan,
  BudgetSourcePlanPageQuery,
  RejectWorkforceBudgetAction,
  UpdateWorkforceBudgetRequest,
  WorkforceBudget,
  WorkforceBudgetAction,
  WorkforceBudgetDetail,
  WorkforceBudgetPageQuery,
  WorkforceBudgetRequest,
} from '../models/workforce-budget';

export interface WorkforceBudgetRepository {
  getPage(query: WorkforceBudgetPageQuery): Promise<WorkforcePlanningPage<WorkforceBudget>>;
  getById(id: number): Promise<WorkforceBudgetDetail>;
  getSourcePlans(query: BudgetSourcePlanPageQuery): Promise<WorkforcePlanningPage<BudgetSourcePlan>>;
  getSourcePlanById(planId: number): Promise<BudgetSourcePlan>;
  create(request: WorkforceBudgetRequest): Promise<WorkforceBudgetDetail>;
  update(id: number, request: UpdateWorkforceBudgetRequest): Promise<WorkforceBudgetDetail>;
  submit(action: WorkforceBudgetAction): Promise<WorkforceBudgetDetail>;
  approve(action: WorkforceBudgetAction): Promise<WorkforceBudgetDetail>;
  reject(action: RejectWorkforceBudgetAction): Promise<WorkforceBudgetDetail>;
}
