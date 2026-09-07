import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  EnvelopeAmendmentDetail,
  EnvelopeAmendmentMutation,
  EnvelopeAmendmentPageQuery,
  EnvelopeAmendmentPageResponse,
  StaffingAction,
  StaffingCloseAction,
  StaffingRejectAction,
  StaffingRequestDetail,
  StaffingRequestMutation,
  StaffingRequestPageQuery,
  StaffingRequestPageResponse,
} from "../types/Staffing";

export default class StaffingService {
  static getAmendments(query: EnvelopeAmendmentPageQuery): Promise<EnvelopeAmendmentPageResponse> { return apiService.get(apiRoutes.workforcePlanning.amendments, { ...query }); }
  static getAmendment(id: number): Promise<EnvelopeAmendmentDetail> { return apiService.get(apiRoutes.workforcePlanning.amendment(id)); }
  static createAmendment(request: EnvelopeAmendmentMutation): Promise<EnvelopeAmendmentDetail> { return apiService.post(apiRoutes.workforcePlanning.amendments, request); }
  static submitAmendment({ id, rowVersion }: StaffingAction): Promise<EnvelopeAmendmentDetail> { return apiService.post(apiRoutes.workforcePlanning.amendmentSubmit(id), { rowVersion }); }
  static approveAmendment({ id, rowVersion }: StaffingAction): Promise<EnvelopeAmendmentDetail> { return apiService.post(apiRoutes.workforcePlanning.amendmentApprove(id), { rowVersion }); }
  static rejectAmendment({ id, rowVersion, reason }: StaffingRejectAction): Promise<EnvelopeAmendmentDetail> { return apiService.post(apiRoutes.workforcePlanning.amendmentReject(id), { rowVersion, reason }); }

  static getRequests(query: StaffingRequestPageQuery): Promise<StaffingRequestPageResponse> { return apiService.get(apiRoutes.workforcePlanning.staffingRequests, { ...query }); }
  static getRequest(id: number): Promise<StaffingRequestDetail> { return apiService.get(apiRoutes.workforcePlanning.staffingRequest(id)); }
  static createRequest(request: StaffingRequestMutation): Promise<StaffingRequestDetail> { return apiService.post(apiRoutes.workforcePlanning.staffingRequests, request); }
  static submitRequest({ id, rowVersion }: StaffingAction): Promise<StaffingRequestDetail> { return apiService.post(apiRoutes.workforcePlanning.staffingRequestSubmit(id), { rowVersion }); }
  static approveRequest({ id, rowVersion }: StaffingAction): Promise<StaffingRequestDetail> { return apiService.post(apiRoutes.workforcePlanning.staffingRequestApprove(id), { rowVersion }); }
  static rejectRequest({ id, rowVersion, reason }: StaffingRejectAction): Promise<StaffingRequestDetail> { return apiService.post(apiRoutes.workforcePlanning.staffingRequestReject(id), { rowVersion, reason }); }
  static closeRequest({ id, rowVersion, closeReason }: StaffingCloseAction): Promise<StaffingRequestDetail> { return apiService.post(apiRoutes.workforcePlanning.staffingRequestClose(id), { rowVersion, closeReason }); }
}
