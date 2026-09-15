import { registerRealtimeQueryKeys } from "@/platform/realtime";
import { fiscalYearKeys } from "./fiscal-years/hooks/useFiscalYearQueries";

export const accountingRealtimeResources = {
  fiscalYears: "fiscal-years",
} as const;

export function registerAccountingRealtimeResources() {
  registerRealtimeQueryKeys({
    [accountingRealtimeResources.fiscalYears]: [fiscalYearKeys.all],
  });
}
