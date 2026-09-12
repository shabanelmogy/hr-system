import { appointmentKeys } from "./appointments";
import {
  addressTypeKeys,
  countryKeys,
  districtKeys,
  organizationalStructureKeys,
  stateKeys,
} from "./basic-data";
import { fiscalYearKeys } from "./finance";
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
  countries: "countries",
  fiscalYears: "fiscal-years",
  workforcePlans: "workforce-plans",
  workforceBudgets: "workforce-budgets",
  positionEnvelopes: "position-envelopes",
  envelopeAmendments: "envelope-amendments",
  staffingRequests: "staffing-requests",
  workforceTrace: "workforce-trace",
  states: "states",
  organizationalStructure: "organizational-structure",
  districts: "districts",
  addressTypes: "address-types",
  addresses: "addresses",
  appointments: "appointments",
} as const;

export function registerHrRealtimeResources() {
  registerRealtimeQueryKeys({
    [hrRealtimeResources.countries]: [countryKeys.all, stateKeys.all],
    [hrRealtimeResources.fiscalYears]: [fiscalYearKeys.all],
    [hrRealtimeResources.workforcePlans]: [workforcePlanKeys.all],
    [hrRealtimeResources.workforceBudgets]: [workforceBudgetKeys.all],
    [hrRealtimeResources.positionEnvelopes]: [positionEnvelopeKeys.all],
    [hrRealtimeResources.envelopeAmendments]: [envelopeAmendmentKeys.all, positionEnvelopeKeys.all],
    [hrRealtimeResources.staffingRequests]: [staffingRequestKeys.all, positionEnvelopeKeys.all],
    [hrRealtimeResources.workforceTrace]: [workforceTraceKeys.all, positionEnvelopeKeys.all, workforceBudgetKeys.all],
    [hrRealtimeResources.states]: [stateKeys.all, countryKeys.all, districtKeys.all],
    [hrRealtimeResources.organizationalStructure]: [organizationalStructureKeys.all],
    [hrRealtimeResources.districts]: [districtKeys.all, stateKeys.all],
    [hrRealtimeResources.addressTypes]: [addressTypeKeys.all],
    [hrRealtimeResources.addresses]: [],
    [hrRealtimeResources.appointments]: [appointmentKeys.all],
  });
}
