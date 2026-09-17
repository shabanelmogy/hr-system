import { registerRealtimeQueryKeys } from "@/platform/realtime/registry";
import { fiscalYearKeys } from "./fiscal-years/hooks/fiscalYearQueryKeys";

export const accountingRealtimeResources = {
  fiscalYears: "fiscal-years",
} as const;

export function registerAccountingRealtimeResources() {
  registerRealtimeQueryKeys({
    [accountingRealtimeResources.fiscalYears]: [fiscalYearKeys.all],
  });
}
