import { apiService, type PageResponse } from '@/src/core/api';
import type { EnvelopeAmendment, EnvelopeAmendmentDetail, EnvelopeAmendmentPageQuery, EnvelopeAmendmentRequest, StaffingAction, StaffingCloseAction, StaffingRejectAction, StaffingRequest, StaffingRequestDetail, StaffingRequestInput, StaffingRequestPageQuery } from '../types/staffing';
import { staffingEndpoints } from './staffing-endpoints';
import { envelopeAmendmentDetailSchema, envelopeAmendmentPageSchema, staffingRequestDetailSchema, staffingRequestPageSchema } from './staffing-schemas';

export function toStaffingQuery(query: EnvelopeAmendmentPageQuery | StaffingRequestPageQuery) {
  const params = new URLSearchParams({ pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), sortBy: query.sortBy, sortDirection: query.sortDirection });
  if (query.envelopeId) params.set('envelopeId', String(query.envelopeId));
  if ('fiscalYearId' in query && query.fiscalYearId) params.set('fiscalYearId', String(query.fiscalYearId));
  if (query.status) params.set('status', query.status);
  if (query.search?.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const staffingApi = {
  async getAmendments(query: EnvelopeAmendmentPageQuery): Promise<PageResponse<EnvelopeAmendment>> { return envelopeAmendmentPageSchema.parse(await apiService.get<unknown>(`${staffingEndpoints.amendments}?${toStaffingQuery(query)}`)); },
  async getAmendment(id: number): Promise<EnvelopeAmendmentDetail> { return envelopeAmendmentDetailSchema.parse(await apiService.get<unknown>(staffingEndpoints.amendmentById(id))); },
  async createAmendment(request: EnvelopeAmendmentRequest): Promise<EnvelopeAmendmentDetail> { return envelopeAmendmentDetailSchema.parse(await apiService.post<unknown, EnvelopeAmendmentRequest>(staffingEndpoints.amendments, request)); },
  async submitAmendment({ id, rowVersion }: StaffingAction): Promise<EnvelopeAmendmentDetail> { return envelopeAmendmentDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(staffingEndpoints.amendmentSubmit(id), { rowVersion })); },
  async approveAmendment({ id, rowVersion }: StaffingAction): Promise<EnvelopeAmendmentDetail> { return envelopeAmendmentDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(staffingEndpoints.amendmentApprove(id), { rowVersion })); },
  async rejectAmendment({ id, rowVersion, reason }: StaffingRejectAction): Promise<EnvelopeAmendmentDetail> { return envelopeAmendmentDetailSchema.parse(await apiService.post<unknown, { rowVersion: string; reason: string }>(staffingEndpoints.amendmentReject(id), { rowVersion, reason })); },
  async getRequests(query: StaffingRequestPageQuery): Promise<PageResponse<StaffingRequest>> { return staffingRequestPageSchema.parse(await apiService.get<unknown>(`${staffingEndpoints.requests}?${toStaffingQuery(query)}`)); },
  async getRequest(id: number): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.get<unknown>(staffingEndpoints.requestById(id))); },
  async createRequest(request: StaffingRequestInput): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.post<unknown, StaffingRequestInput>(staffingEndpoints.requests, request)); },
  async submitRequest({ id, rowVersion }: StaffingAction): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(staffingEndpoints.requestSubmit(id), { rowVersion })); },
  async approveRequest({ id, rowVersion }: StaffingAction): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.post<unknown, { rowVersion: string }>(staffingEndpoints.requestApprove(id), { rowVersion })); },
  async rejectRequest({ id, rowVersion, reason }: StaffingRejectAction): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.post<unknown, { rowVersion: string; reason: string }>(staffingEndpoints.requestReject(id), { rowVersion, reason })); },
  async closeRequest({ id, rowVersion, closeReason }: StaffingCloseAction): Promise<StaffingRequestDetail> { return staffingRequestDetailSchema.parse(await apiService.post<unknown, { rowVersion: string; closeReason: number }>(staffingEndpoints.requestClose(id), { rowVersion, closeReason })); },
};
