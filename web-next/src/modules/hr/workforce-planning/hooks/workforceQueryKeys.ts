import type { WorkforcePlanPageQuery } from "../types/WorkforcePlan";
import type {
  BudgetSourcePlanPageQuery,
  PositionEnvelopePageQuery,
  WorkforceBudgetPageQuery,
} from "../types/WorkforceBudget";
import type {
  EnvelopeAmendmentPageQuery,
  StaffingRequestPageQuery,
} from "../types/Staffing";
import type { PlanCommitmentPageQuery } from "../types/WorkforceTrace";

export const workforcePlanKeys = {
  all: ["workforcePlans"] as const,
  page: (query: WorkforcePlanPageQuery) => [...workforcePlanKeys.all, "page", query] as const,
  detail: (id: number) => [...workforcePlanKeys.all, "detail", id] as const,
  revisions: (id: number) => [...workforcePlanKeys.all, "revisions", id] as const,
};

export const workforceBudgetKeys = {
  all: ["workforceBudgets"] as const,
  page: (query: WorkforceBudgetPageQuery) => [...workforceBudgetKeys.all, "page", query] as const,
  detail: (id: number) => [...workforceBudgetKeys.all, "detail", id] as const,
  sourcePlans: (query: BudgetSourcePlanPageQuery) => [...workforceBudgetKeys.all, "source-plans", query] as const,
  sourcePlan: (planId: number) => [...workforceBudgetKeys.all, "source-plan", planId] as const,
};

export const positionEnvelopeKeys = {
  all: ["positionEnvelopes"] as const,
  page: (query: PositionEnvelopePageQuery) => [...positionEnvelopeKeys.all, "page", query] as const,
  detail: (id: number) => [...positionEnvelopeKeys.all, "detail", id] as const,
};

export const envelopeAmendmentKeys = {
  all: ["envelopeAmendments"] as const,
  page: (query: EnvelopeAmendmentPageQuery) => [...envelopeAmendmentKeys.all, "page", query] as const,
  detail: (id: number) => [...envelopeAmendmentKeys.all, "detail", id] as const,
};

export const staffingRequestKeys = {
  all: ["staffingRequests"] as const,
  page: (query: StaffingRequestPageQuery) => [...staffingRequestKeys.all, "page", query] as const,
  detail: (id: number) => [...staffingRequestKeys.all, "detail", id] as const,
};

export const workforceTraceKeys = {
  all: ["workforceTrace"] as const,
  byApplication: (applicationId: number) => [...workforceTraceKeys.all, "application", applicationId] as const,
  byOffer: (offerId: number) => [...workforceTraceKeys.all, "offer", offerId] as const,
  byEmployee: (employeeId: number) => [...workforceTraceKeys.all, "employee", employeeId] as const,
  planCommitment: (query: PlanCommitmentPageQuery) => [...workforceTraceKeys.all, "plan-commitment", query] as const,
};
