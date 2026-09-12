import { apiService, type PageResponse } from '@/src/core/api';
import type { HiringTrace, PlanCommitmentPageQuery, PlanCommitmentRow } from '../../domain/models/workforce-trace';
import { workforceTraceEndpoints } from './workforce-trace-endpoints';
import { commitmentPageSchema, workforceTraceSchema } from './workforce-trace-schemas';

function parseTrace(value: unknown): HiringTrace { return workforceTraceSchema.parse(value); }
export function toCommitmentQuery(query: PlanCommitmentPageQuery) {
  const params = new URLSearchParams({ fiscalYearId: String(query.fiscalYearId), pageNumber: String(query.pageNumber), pageSize: String(query.pageSize) });
  if (query.positionId) params.set('positionId', String(query.positionId));
  if (query.branchId) params.set('branchId', String(query.branchId));
  return params.toString();
}
export const workforceTraceRemoteDataSource = {
  async byApplication(id: number) { return parseTrace(await apiService.get<unknown>(workforceTraceEndpoints.application(id))); },
  async byOffer(id: number) { return parseTrace(await apiService.get<unknown>(workforceTraceEndpoints.offer(id))); },
  async byEmployee(id: number) { return parseTrace(await apiService.get<unknown>(workforceTraceEndpoints.employee(id))); },
  async commitment(query: PlanCommitmentPageQuery): Promise<PageResponse<PlanCommitmentRow>> { return commitmentPageSchema.parse(await apiService.get<unknown>(`${workforceTraceEndpoints.commitment}?${toCommitmentQuery(query)}`)); },
};
