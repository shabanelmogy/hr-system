import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import { z } from "zod";
import type {
  HiringTrace,
  PlanCommitmentPageQuery,
  PlanCommitmentPageResponse,
} from "../types/WorkforceTrace";

const traceNodeSchema = z.object({
  key: z.string(), kind: z.string(), title: z.string(), status: z.string().nullable().optional(),
  occurredOn: z.string().nullable().optional(), fiscalCost: z.number().nullable().optional(), currencyCode: z.string().nullable().optional(),
});
const traceSchema = z.object({
  nodes: z.array(traceNodeSchema),
  edges: z.array(z.object({ fromKey: z.string(), toKey: z.string(), relation: z.string() })),
});
const commitmentRowSchema = z.object({
  fiscalYearId: z.number(), positionEnvelopeId: z.number(), envelopeCode: z.string(), workforceBudgetId: z.number(), budgetCode: z.string(),
  workforcePlanId: z.number(), planCode: z.string(), positionId: z.number(), branchId: z.number().nullable().optional(),
  authorizedHeadcount: z.number(), reservedHeadcount: z.number(), hiredHeadcount: z.number(), availableHeadcount: z.number(),
  authorizedSalaryCost: z.number().nullable().optional(), reservedSalaryCost: z.number().nullable().optional(), contractedSalaryCost: z.number().nullable().optional(), availableSalaryCost: z.number().nullable().optional(), currencyCode: z.string().nullable().optional(),
  staffingRequests: z.number(), requisitions: z.number(), openings: z.number(), offers: z.number(), hires: z.number(),
});
const pageSchema = z.object({ items: z.array(commitmentRowSchema), metaData: z.object({ currentPage: z.number(), pageNumber: z.number(), pageSize: z.number(), totalCount: z.number(), totalPages: z.number() }) });

export default class WorkforceTraceService {
  static getByApplication(applicationId: number): Promise<HiringTrace> {
    return apiService.get<unknown>(apiRoutes.workforcePlanning.traceByApplication(applicationId)).then(value => traceSchema.parse(value));
  }
  static getByOffer(offerId: number): Promise<HiringTrace> {
    return apiService.get<unknown>(apiRoutes.workforcePlanning.traceByOffer(offerId)).then(value => traceSchema.parse(value));
  }
  static getByEmployee(employeeId: number): Promise<HiringTrace> {
    return apiService.get<unknown>(apiRoutes.workforcePlanning.traceByEmployee(employeeId)).then(value => traceSchema.parse(value));
  }
  static getPlanCommitment(query: PlanCommitmentPageQuery): Promise<PlanCommitmentPageResponse> {
    return apiService.get<unknown>(apiRoutes.workforcePlanning.planCommitment, { ...query }).then(value => pageSchema.parse(value) as PlanCommitmentPageResponse);
  }
}
