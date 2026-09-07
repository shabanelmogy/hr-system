import { version } from "./constants";
import type { Id } from "./types";

const base = `${version}/workforce-planning/plans`;

const budgetBase = `${version}/workforce-planning/budgets`;
const envelopeBase = `${version}/workforce-planning/position-envelopes`;
const amendmentBase = `${version}/workforce-planning/envelope-amendments`;
const staffingBase = `${version}/workforce-planning/staffing-requests`;

const traceBase = `${version}/workforce-planning/trace`;

export const workforcePlanning = {
  plans: base,
  plan: (id: Id) => `${base}/${id}`,
  restore: (id: Id) => `${base}/${id}/restore`,
  submit: (id: Id) => `${base}/${id}/submit`,
  beginReview: (id: Id) => `${base}/${id}/begin-review`,
  approve: (id: Id) => `${base}/${id}/approve`,
  reject: (id: Id) => `${base}/${id}/reject`,
  revisions: (id: Id) => `${base}/${id}/revisions`,
  budgets: budgetBase,
  budget: (id: Id) => `${budgetBase}/${id}`,
  budgetSubmit: (id: Id) => `${budgetBase}/${id}/submit`,
  budgetApprove: (id: Id) => `${budgetBase}/${id}/approve`,
  budgetReject: (id: Id) => `${budgetBase}/${id}/reject`,
  budgetSourcePlans: `${budgetBase}/source-plans`,
  budgetSourcePlan: (planId: Id) => `${budgetBase}/source-plans/${planId}`,
  envelopes: envelopeBase,
  envelope: (id: Id) => `${envelopeBase}/${id}`,
  amendments: amendmentBase,
  amendment: (id: Id) => `${amendmentBase}/${id}`,
  amendmentSubmit: (id: Id) => `${amendmentBase}/${id}/submit`,
  amendmentApprove: (id: Id) => `${amendmentBase}/${id}/approve`,
  amendmentReject: (id: Id) => `${amendmentBase}/${id}/reject`,
  staffingRequests: staffingBase,
  staffingRequest: (id: Id) => `${staffingBase}/${id}`,
  staffingRequestSubmit: (id: Id) => `${staffingBase}/${id}/submit`,
  staffingRequestApprove: (id: Id) => `${staffingBase}/${id}/approve`,
  staffingRequestReject: (id: Id) => `${staffingBase}/${id}/reject`,
  staffingRequestClose: (id: Id) => `${staffingBase}/${id}/close`,
  traceByApplication: (applicationId: Id) => `${traceBase}/application/${applicationId}`,
  traceByOffer: (offerId: Id) => `${traceBase}/offer/${offerId}`,
  traceByEmployee: (employeeId: Id) => `${traceBase}/employee/${employeeId}`,
  planCommitment: `${traceBase}/plan-commitment`,
} as const;
