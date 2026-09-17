import { useQuery } from "@tanstack/react-query";
import WorkforceTraceService from "../services/workforceTraceService";
import type { PlanCommitmentPageQuery } from "../types/WorkforceTrace";
import { workforceTraceKeys } from "./workforceQueryKeys";

export { workforceTraceKeys } from "./workforceQueryKeys";

export const useHiringTraceByApplication = (applicationId?: number | null, enabled = true) =>
  useQuery({
    queryKey: workforceTraceKeys.byApplication(applicationId ?? 0),
    queryFn: () => WorkforceTraceService.getByApplication(applicationId!),
    enabled: !!applicationId && enabled,
  });

export const useHiringTraceByOffer = (offerId?: number | null, enabled = true) =>
  useQuery({
    queryKey: workforceTraceKeys.byOffer(offerId ?? 0),
    queryFn: () => WorkforceTraceService.getByOffer(offerId!),
    enabled: !!offerId && enabled,
  });

export const useHiringTraceByEmployee = (employeeId?: number | null, enabled = true) =>
  useQuery({
    queryKey: workforceTraceKeys.byEmployee(employeeId ?? 0),
    queryFn: () => WorkforceTraceService.getByEmployee(employeeId!),
    enabled: !!employeeId && enabled,
  });

export const usePlanCommitmentPage = (query: PlanCommitmentPageQuery, enabled = true) =>
  useQuery({
    queryKey: workforceTraceKeys.planCommitment(query),
    queryFn: () => WorkforceTraceService.getPlanCommitment(query),
    enabled: enabled && query.fiscalYearId > 0,
  });

