import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  BudgetSourcePlan,
  BudgetSourcePlanPageQuery,
  BudgetSourcePlanPageResponse,
  PositionEnvelopeDetail,
  PositionEnvelopePageQuery,
  PositionEnvelopePageResponse,
  RejectWorkforceBudgetMutation,
  UpdateWorkforceBudgetMutation,
  WorkforceBudgetActionMutation,
  WorkforceBudgetDetail,
  WorkforceBudgetMutationRequest,
  WorkforceBudgetPageQuery,
  WorkforceBudgetPageResponse,
} from "../types/WorkforceBudget";

export default class WorkforceBudgetService {
  static getPage(query: WorkforceBudgetPageQuery): Promise<WorkforceBudgetPageResponse> { return apiService.get(apiRoutes.workforcePlanning.budgets, { ...query }); }
  static getById(id: number): Promise<WorkforceBudgetDetail> { return apiService.get(apiRoutes.workforcePlanning.budget(id)); }
  static getSourcePlans(query: BudgetSourcePlanPageQuery): Promise<BudgetSourcePlanPageResponse> { return apiService.get(apiRoutes.workforcePlanning.budgetSourcePlans, { ...query }); }
  static getSourcePlanById(planId: number): Promise<BudgetSourcePlan> { return apiService.get(apiRoutes.workforcePlanning.budgetSourcePlan(planId)); }
  static create(request: WorkforceBudgetMutationRequest): Promise<WorkforceBudgetDetail> { return apiService.post(apiRoutes.workforcePlanning.budgets, request); }
  static update({ id, request }: UpdateWorkforceBudgetMutation): Promise<WorkforceBudgetDetail> { return apiService.put(apiRoutes.workforcePlanning.budget(id), request); }
  static submit({ id, rowVersion }: WorkforceBudgetActionMutation): Promise<WorkforceBudgetDetail> { return apiService.post(apiRoutes.workforcePlanning.budgetSubmit(id), { rowVersion }); }
  static approve({ id, rowVersion }: WorkforceBudgetActionMutation): Promise<WorkforceBudgetDetail> { return apiService.post(apiRoutes.workforcePlanning.budgetApprove(id), { rowVersion }); }
  static reject({ id, reason, rowVersion }: RejectWorkforceBudgetMutation): Promise<WorkforceBudgetDetail> { return apiService.post(apiRoutes.workforcePlanning.budgetReject(id), { reason, rowVersion }); }
  static getEnvelopePage(query: PositionEnvelopePageQuery): Promise<PositionEnvelopePageResponse> { return apiService.get(apiRoutes.workforcePlanning.envelopes, { ...query }); }
  static getEnvelopeById(id: number): Promise<PositionEnvelopeDetail> { return apiService.get(apiRoutes.workforcePlanning.envelope(id)); }
}
