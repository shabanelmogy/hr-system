import { apiService, type PageResponse } from '@/src/core/api';
import type { RejectWorkforcePlanAction, UpdateWorkforcePlanRequest, WorkforcePlan, WorkforcePlanAction, WorkforcePlanDetail, WorkforcePlanPageQuery, WorkforcePlanRequest } from '../../domain/models/workforce-plan';
import { workforcePlanEndpoints } from './workforce-plan-endpoints';
import { workforcePlanDetailSchema, workforcePlanPageSchema, workforcePlanRevisionsSchema } from './workforce-plan-schemas';

export function toWorkforcePlanPageQuery(query: WorkforcePlanPageQuery) {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.status) params.set('status', query.status);
  if (query.recordStatus) params.set('recordStatus', query.recordStatus);
  if (query.fiscalYearId) params.set('fiscalYearId', String(query.fiscalYearId));
  if (query.search?.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const workforcePlanRemoteDataSource = {
  async getPage(query: WorkforcePlanPageQuery): Promise<PageResponse<WorkforcePlan>> { return workforcePlanPageSchema.parse(await apiService.get<unknown>(`${workforcePlanEndpoints.base}?${toWorkforcePlanPageQuery(query)}`)); },
  async getById(id: number, requestContextSignal?: AbortSignal): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.get<unknown>(workforcePlanEndpoints.byId(id), { requestContextSignal })); },
  async getRevisions(id: number): Promise<WorkforcePlanDetail[]> { return workforcePlanRevisionsSchema.parse(await apiService.get<unknown>(workforcePlanEndpoints.revisions(id))); },
  async create(request: WorkforcePlanRequest): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, WorkforcePlanRequest>(workforcePlanEndpoints.create, request)); },
  async update(id: number, request: UpdateWorkforcePlanRequest, requestContextSignal?: AbortSignal): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.put<unknown, UpdateWorkforcePlanRequest>(workforcePlanEndpoints.byId(id), request, { requestContextSignal })); },
  async archive({ id, rowVersion }: WorkforcePlanAction): Promise<void> { await apiService.delete<unknown>(workforcePlanEndpoints.byId(id), { data: { rowVersion } }); },
  async restore({ id, rowVersion }: WorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforcePlanEndpoints.restore(id), { rowVersion })); },
  async submit({ id, rowVersion }: WorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforcePlanEndpoints.submit(id), { rowVersion })); },
  async beginReview({ id, rowVersion }: WorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforcePlanEndpoints.beginReview(id), { rowVersion })); },
  async approve({ id, rowVersion }: WorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforcePlanEndpoints.approve(id), { rowVersion })); },
  async reject({ id, rowVersion, reason }: RejectWorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string; reason: string }>(workforcePlanEndpoints.reject(id), { rowVersion, reason })); },
  async createRevision({ id, rowVersion }: WorkforcePlanAction): Promise<WorkforcePlanDetail> { return workforcePlanDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(workforcePlanEndpoints.revisions(id), { rowVersion })); },
};
