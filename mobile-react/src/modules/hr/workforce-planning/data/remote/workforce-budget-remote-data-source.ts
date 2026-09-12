import { apiService, type PageResponse } from '@/src/core/api';
import type {
  BudgetSourcePlan,
  BudgetSourcePlanPageQuery,
  PositionEnvelope,
  PositionEnvelopeDetail,
  PositionEnvelopePageQuery,
  RejectWorkforceBudgetAction,
  UpdateWorkforceBudgetRequest,
  WorkforceBudget,
  WorkforceBudgetAction,
  WorkforceBudgetDetail,
  WorkforceBudgetPageQuery,
  WorkforceBudgetRequest,
} from '../../domain/models/workforce-budget';
import { workforceBudgetEndpoints } from './workforce-budget-endpoints';
import { budgetSourcePlanPageSchema, budgetSourcePlanSchema, positionEnvelopeDetailSchema, positionEnvelopePageSchema, workforceBudgetDetailSchema, workforceBudgetPageSchema } from './workforce-budget-schemas';

export function toWorkforceBudgetPageQuery(query: WorkforceBudgetPageQuery) {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.status) params.set('status', query.status);
  if (query.fiscalYearId) params.set('fiscalYearId', String(query.fiscalYearId));
  if (query.workforcePlanId) params.set('workforcePlanId', String(query.workforcePlanId));
  if (query.search?.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export function toPositionEnvelopePageQuery(query: PositionEnvelopePageQuery) {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.fiscalYearId) params.set('fiscalYearId', String(query.fiscalYearId));
  if (query.workforceBudgetId) params.set('workforceBudgetId', String(query.workforceBudgetId));
  if (query.workforcePlanId) params.set('workforcePlanId', String(query.workforcePlanId));
  if (query.branchId) params.set('branchId', String(query.branchId));
  if (query.departmentId) params.set('departmentId', String(query.departmentId));
  if (query.positionId) params.set('positionId', String(query.positionId));
  if (query.search?.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const workforceBudgetRemoteDataSource = {
  async getPage(query: WorkforceBudgetPageQuery): Promise<PageResponse<WorkforceBudget>> { return workforceBudgetPageSchema.parse(await apiService.get<unknown>(`${workforceBudgetEndpoints.base}?${toWorkforceBudgetPageQuery(query)}`)); },
  async getById(id: number): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.get<unknown>(workforceBudgetEndpoints.byId(id))); },
  async getSourcePlans(query: BudgetSourcePlanPageQuery): Promise<PageResponse<BudgetSourcePlan>> {
    const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize) });
    if (query.fiscalYearId) params.set('fiscalYearId', String(query.fiscalYearId));
    if (query.search?.trim()) params.set('search', query.search.trim());
    return budgetSourcePlanPageSchema.parse(await apiService.get<unknown>(`${workforceBudgetEndpoints.sourcePlans}?${params.toString()}`));
  },
  async getSourcePlanById(planId: number): Promise<BudgetSourcePlan> { return budgetSourcePlanSchema.parse(await apiService.get<unknown>(workforceBudgetEndpoints.sourcePlanById(planId))); },
  async create(request: WorkforceBudgetRequest): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.post<unknown, WorkforceBudgetRequest>(workforceBudgetEndpoints.create, request)); },
  async update(id: number, request: UpdateWorkforceBudgetRequest): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.put<unknown, UpdateWorkforceBudgetRequest>(workforceBudgetEndpoints.byId(id), request)); },
  async submit({ id, rowVersion }: WorkforceBudgetAction): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforceBudgetEndpoints.submit(id), { rowVersion })); },
  async approve({ id, rowVersion }: WorkforceBudgetAction): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforceBudgetEndpoints.approve(id), { rowVersion })); },
  async reject({ id, rowVersion, reason }: RejectWorkforceBudgetAction): Promise<WorkforceBudgetDetail> { return workforceBudgetDetailSchema.parse(await apiService.post<unknown, { rowVersion: string; reason: string }>(workforceBudgetEndpoints.reject(id), { rowVersion, reason })); },
  async getEnvelopePage(query: PositionEnvelopePageQuery): Promise<PageResponse<PositionEnvelope>> { return positionEnvelopePageSchema.parse(await apiService.get<unknown>(`${workforceBudgetEndpoints.envelopes}?${toPositionEnvelopePageQuery(query)}`)); },
  async getEnvelopeById(id: number): Promise<PositionEnvelopeDetail> { return positionEnvelopeDetailSchema.parse(await apiService.get<unknown>(workforceBudgetEndpoints.envelopeById(id))); },
};
