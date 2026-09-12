import type { ManagementPageResponse } from "@/lib/api/pagination";

export interface WorkforceTraceNode {
  key: string;
  kind: string;
  title: string;
  status?: string | null;
  occurredOn?: string | null;
  fiscalCost?: number | null;
  currencyCode?: string | null;
}

export interface WorkforceTraceEdge {
  fromKey: string;
  toKey: string;
  relation: string;
}

export interface HiringTrace {
  nodes: WorkforceTraceNode[];
  edges: WorkforceTraceEdge[];
}

export interface PlanCommitmentRow {
  fiscalYearId: number;
  positionEnvelopeId: number;
  envelopeCode: string;
  workforceBudgetId: number;
  budgetCode: string;
  workforcePlanId: number;
  planCode: string;
  positionId: number;
  branchId?: number | null;
  authorizedHeadcount: number;
  reservedHeadcount: number;
  hiredHeadcount: number;
  availableHeadcount: number;
  authorizedSalaryCost?: number | null;
  reservedSalaryCost?: number | null;
  contractedSalaryCost?: number | null;
  availableSalaryCost?: number | null;
  currencyCode?: string | null;
  staffingRequests: number;
  requisitions: number;
  openings: number;
  offers: number;
  hires: number;
}

export interface PlanCommitmentPageQuery {
  fiscalYearId: number;
  pageNumber?: number;
  pageSize?: number;
  positionId?: number;
  branchId?: number;
}

export type PlanCommitmentPageResponse = ManagementPageResponse<PlanCommitmentRow>;

