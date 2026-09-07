import type { ManagementPageResponse } from "@/lib/api/pagination";

export type WorkforceBudgetStatus = 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkforceBudgetPeriodAllocationRequest {
  fiscalPeriodId: number;
  targetHeadcount: number;
  allocatedSalaryCost: number;
  allocatedRecruitmentCost: number;
}

export interface WorkforceBudgetLineRequest {
  workforcePlanLineId: number;
  authorizedHeadcount: number;
  allocatedSalaryBudget: number;
  allocatedRecruitmentBudget: number;
  periodAllocations: WorkforceBudgetPeriodAllocationRequest[];
}

export interface WorkforceBudgetMutationRequest {
  budgetCode: string;
  workforcePlanId: number;
  currencyCode: string;
  lines: WorkforceBudgetLineRequest[];
}

export interface UpdateWorkforceBudgetMutation {
  id: number;
  request: { currencyCode: string; lines: WorkforceBudgetLineRequest[]; rowVersion: string };
}

export interface WorkforceBudgetActionMutation {
  id: number;
  rowVersion: string;
}

export interface RejectWorkforceBudgetMutation extends WorkforceBudgetActionMutation {
  reason: string;
}

export interface WorkforceBudgetPermissions {
  canView: boolean;
  canManage: boolean;
  canApprove: boolean;
}

export interface WorkforceBudgetListItem {
  id: number;
  budgetCode: string;
  workforcePlanId: number;
  fiscalYearId: number;
  revisionNumber: number;
  currencyCode: string;
  status: WorkforceBudgetStatus;
  totalAuthorizedHeadcount: number;
  totalSalaryBudget: number;
  totalRecruitmentBudget: number;
  grandTotalBudget: number;
  isEffective: boolean;
  activatedOn: string | null;
  createdOn: string;
  updatedOn: string | null;
  rowVersion: string;
}

export interface WorkforceBudgetPeriodAllocation extends WorkforceBudgetPeriodAllocationRequest { id: number }
export interface WorkforceBudgetLine extends Omit<WorkforceBudgetLineRequest, "periodAllocations"> {
  id: number;
  positionId: number;
  branchId: number | null;
  departmentId: number;
  divisionId: number;
  totalAllocatedBudget: number;
  periodAllocations: WorkforceBudgetPeriodAllocation[];
}

export interface WorkforceBudgetDetail extends Pick<WorkforceBudgetListItem,
  "id" | "budgetCode" | "workforcePlanId" | "fiscalYearId" | "revisionNumber" | "currencyCode" | "status" | "isEffective" | "createdOn" | "updatedOn" | "rowVersion"> {
  calculationPolicyVersion: string;
  submittedOn: string | null;
  submittedById: string | null;
  approvedOn: string | null;
  approvedById: string | null;
  rejectedOn: string | null;
  rejectedById: string | null;
  decisionReason: string | null;
  activatedOn: string | null;
  supersededOn: string | null;
  totalAuthorizedHeadcount: number;
  totalSalaryBudget: number;
  totalRecruitmentBudget: number;
  grandTotalBudget: number;
  lines: WorkforceBudgetLine[];
}

export interface WorkforceBudgetPageQuery {
  pageNumber: number;
  pageSize: number;
  fiscalYearId?: number;
  workforcePlanId?: number;
  status?: string;
  search?: string;
  sortBy: "budgetCode" | "status" | "createdOn" | "grandTotal";
  sortDirection: "asc" | "desc";
}

export type WorkforceBudgetPageResponse = ManagementPageResponse<WorkforceBudgetListItem>;

export interface BudgetSourcePlanPeriod {
  fiscalPeriodId: number;
  newHireSlots: number;
  replacementSlots: number;
}

export interface BudgetSourcePlanLine {
  id: number;
  positionId: number;
  targetBranchId: number | null;
  departmentId: number;
  divisionId: number;
  baselineHeadcount: number;
  newHireSlots: number;
  replacementSlots: number;
  plannedHiringSlots: number;
  justification: string | null;
  periodTargets: BudgetSourcePlanPeriod[];
}

export interface BudgetSourcePlan {
  id: number;
  planCode: string;
  fiscalYearId: number;
  revisionNumber: number;
  titleEn: string;
  titleAr: string;
  fiscalPeriodIds: number[];
  lines: BudgetSourcePlanLine[];
}

export interface BudgetSourcePlanPageQuery {
  pageNumber: number;
  pageSize: number;
  fiscalYearId?: number;
  search?: string;
}

export type BudgetSourcePlanPageResponse = ManagementPageResponse<BudgetSourcePlan>;

export interface PositionEnvelopeListItem {
  id: number;
  envelopeCode: string;
  workforceBudgetId: number;
  fiscalYearId: number;
  positionId: number;
  branchId: number | null;
  departmentId: number;
  divisionId: number;
  currencyCode: string;
  authorizedHeadcount: number;
  reservedHeadcount: number;
  hiredHeadcount: number;
  availableHeadcount: number;
  authorizedSalaryBudget: number;
  reservedSalaryBudget: number;
  contractedSalaryBudget: number;
  availableSalaryBudget: number;
  createdOn: string;
  rowVersion: string;
}

export interface PositionEnvelopeDetail extends Omit<PositionEnvelopeListItem, "createdOn" | "rowVersion"> {
  workforceBudgetLineId: number;
  workforcePlanId: number;
  workforcePlanLineId: number;
  calculationPolicyVersion: string;
  createdOn: string;
  updatedOn: string | null;
  rowVersion: string;
}

export interface PositionEnvelopePageQuery {
  pageNumber: number;
  pageSize: number;
  fiscalYearId?: number;
  workforceBudgetId?: number;
  workforcePlanId?: number;
  branchId?: number;
  departmentId?: number;
  positionId?: number;
  search?: string;
  sortBy: "envelopeCode" | "createdOn";
  sortDirection: "asc" | "desc";
}

export type PositionEnvelopePageResponse = ManagementPageResponse<PositionEnvelopeListItem>;
