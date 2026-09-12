export type EnvelopeAmendmentStatus = 1 | 2 | 3 | 4;
export type StaffingRequestStatus = 1 | 2 | 3 | 4 | 5;
export type StaffingRequestType = 1 | 2;
export type StaffingRequestPriority = 1 | 2 | 3 | 4;
export type StaffingRequestCloseReason = 1 | 2 | 3;
export interface StaffingAction { id: number; rowVersion: string }
export interface StaffingRejectAction extends StaffingAction { reason: string }
export interface StaffingCloseAction extends StaffingAction { closeReason: StaffingRequestCloseReason }
export interface EnvelopeAmendmentRequest { envelopeId: number; additionalHeadcount: number; additionalSalaryCost: number; justification: string }
export interface EnvelopeAmendment {
  id: number; envelopeId: number; envelopeCode: string; additionalHeadcount: number; additionalSalaryCost: number;
  status: EnvelopeAmendmentStatus; createdOn: string; updatedOn: string | null; rowVersion: string;
}
export interface EnvelopeAmendmentDetail extends EnvelopeAmendment {
  justification: string; requestedById: string | null; submittedOn: string | null; submittedById: string | null;
  approvedOn: string | null; approvedById: string | null; rejectedOn: string | null; rejectedById: string | null; decisionReason: string | null;
}
export interface EnvelopeAmendmentPageQuery { pageNumber: number; pageSize: number; envelopeId?: number; status?: string; search?: string; sortBy: 'createdOn'; sortDirection: 'asc' | 'desc' }
export interface StaffingRequestInput { envelopeId: number; requestedHeadcount: number; estimatedAnnualSalaryPerSlot: number; targetStartDate: string; requestType: StaffingRequestType; priority: StaffingRequestPriority; justification: string }
export interface StaffingRequest {
  id: number; envelopeId: number; envelopeCode: string; requestedHeadcount: number; estimatedAnnualSalaryPerSlot: number; estimatedFiscalYearCostPerSlot: number;
  totalReservedCost: number; targetStartDate: string; requestType: StaffingRequestType; priority: StaffingRequestPriority; status: StaffingRequestStatus;
  remainingAllocatable: number; remainingToHire: number; createdOn: string; rowVersion: string;
}
export interface StaffingRequestDetail extends StaffingRequest {
  justification: string; currencyCode: string; calculationPolicyVersion: string; allocatedRequisitionPositions: number; hiredPositions: number;
  closeReason: StaffingRequestCloseReason | null; submittedOn: string | null; submittedById: string | null; approvedOn: string | null; approvedById: string | null;
  rejectedOn: string | null; rejectedById: string | null; decisionReason: string | null; closedOn: string | null; updatedOn: string | null;
}
export interface StaffingRequestPageQuery { pageNumber: number; pageSize: number; envelopeId?: number; fiscalYearId?: number; status?: string; search?: string; sortBy: 'createdOn' | 'targetStartDate'; sortDirection: 'asc' | 'desc' }
