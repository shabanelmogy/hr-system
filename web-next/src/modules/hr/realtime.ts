import { organizationalStructureKeys } from "./basic-data";
import {
  envelopeAmendmentKeys,
  positionEnvelopeKeys,
  staffingRequestKeys,
  workforceBudgetKeys,
  workforcePlanKeys,
  workforceTraceKeys,
} from "./workforce-planning";
import { registerRealtimeQueryKeys } from "@/platform/realtime";

export const hrRealtimeResources = {
  workforcePlans: "workforce-plans",
  workforceBudgets: "workforce-budgets",
  positionEnvelopes: "position-envelopes",
  envelopeAmendments: "envelope-amendments",
  staffingRequests: "staffing-requests",
  workforceTrace: "workforce-trace",
  organizationalStructure: "organizational-structure",
} as const;

export function registerHrRealtimeResources() {
  registerRealtimeQueryKeys({
    [hrRealtimeResources.workforcePlans]: [workforcePlanKeys.all],
    [hrRealtimeResources.workforceBudgets]: [workforceBudgetKeys.all],
    [hrRealtimeResources.positionEnvelopes]: [positionEnvelopeKeys.all],
    [hrRealtimeResources.envelopeAmendments]: [envelopeAmendmentKeys.all, positionEnvelopeKeys.all],
    [hrRealtimeResources.staffingRequests]: [staffingRequestKeys.all, positionEnvelopeKeys.all],
    [hrRealtimeResources.workforceTrace]: [workforceTraceKeys.all, positionEnvelopeKeys.all, workforceBudgetKeys.all],
    [hrRealtimeResources.organizationalStructure]: [organizationalStructureKeys.all],
  });
}
