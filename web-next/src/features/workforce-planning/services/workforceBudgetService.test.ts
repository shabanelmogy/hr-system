import { apiRoutes } from "@/config";
import type { TFunction } from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWorkforceBudgetSchema } from "../validation/workforceBudgetValidation";
import WorkforceBudgetService from "./workforceBudgetService";

const { get, post, put } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get, post, put } }));
const t = ((key: string) => key) as TFunction;

describe("WorkforceBudgetService", () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); put.mockReset(); });

  it("serializes create/update payloads and lifecycle commands with row versions", async () => {
    post.mockResolvedValue({ id: 3 });
    put.mockResolvedValue({ id: 3 });
    const lines = [{ workforcePlanLineId: 11, authorizedHeadcount: 2, allocatedSalaryBudget: 120000, allocatedRecruitmentBudget: 8000, periodAllocations: [{ fiscalPeriodId: 5, targetHeadcount: 2, allocatedSalaryCost: 120000, allocatedRecruitmentCost: 8000 }] }];

    await WorkforceBudgetService.create({ budgetCode: "WB-2027-001", workforcePlanId: 9, currencyCode: "EGP", lines });
    await WorkforceBudgetService.update({ id: 3, request: { currencyCode: "EGP", lines, rowVersion: "AQ==" } });
    await WorkforceBudgetService.submit({ id: 3, rowVersion: "Ag==" });
    await WorkforceBudgetService.approve({ id: 3, rowVersion: "Aw==" });
    await WorkforceBudgetService.reject({ id: 3, rowVersion: "BA==", reason: "Revise" });

    expect(post).toHaveBeenNthCalledWith(1, apiRoutes.workforcePlanning.budgets, { budgetCode: "WB-2027-001", workforcePlanId: 9, currencyCode: "EGP", lines });
    expect(put).toHaveBeenCalledWith(apiRoutes.workforcePlanning.budget(3), { currencyCode: "EGP", lines, rowVersion: "AQ==" });
    expect(post).toHaveBeenNthCalledWith(2, apiRoutes.workforcePlanning.budgetSubmit(3), { rowVersion: "Ag==" });
    expect(post).toHaveBeenNthCalledWith(3, apiRoutes.workforcePlanning.budgetApprove(3), { rowVersion: "Aw==" });
    expect(post).toHaveBeenNthCalledWith(4, apiRoutes.workforcePlanning.budgetReject(3), { rowVersion: "BA==", reason: "Revise" });
  });

  it("queries budgets with filters and reads source plans and envelopes", async () => {
    get.mockResolvedValue({ items: [] });
    await WorkforceBudgetService.getPage({ pageNumber: 1, pageSize: 10, status: "submitted", fiscalYearId: 4, workforcePlanId: 9, sortBy: "createdOn", sortDirection: "desc" });
    await WorkforceBudgetService.getSourcePlans({ pageNumber: 1, pageSize: 10 });
    await WorkforceBudgetService.getSourcePlanById(9);
    await WorkforceBudgetService.getEnvelopePage({ pageNumber: 1, pageSize: 10, sortBy: "createdOn", sortDirection: "desc" });
    await WorkforceBudgetService.getEnvelopeById(2);

    expect(get).toHaveBeenNthCalledWith(1, apiRoutes.workforcePlanning.budgets, { pageNumber: 1, pageSize: 10, status: "submitted", fiscalYearId: 4, workforcePlanId: 9, sortBy: "createdOn", sortDirection: "desc" });
    expect(get).toHaveBeenNthCalledWith(2, apiRoutes.workforcePlanning.budgetSourcePlans, { pageNumber: 1, pageSize: 10 });
    expect(get).toHaveBeenNthCalledWith(3, apiRoutes.workforcePlanning.budgetSourcePlan(9));
    expect(get).toHaveBeenNthCalledWith(4, apiRoutes.workforcePlanning.envelopes, { pageNumber: 1, pageSize: 10, sortBy: "createdOn", sortDirection: "desc" });
    expect(get).toHaveBeenNthCalledWith(5, apiRoutes.workforcePlanning.envelope(2));
  });

  it("rejects duplicate periods and mismatched category totals before submission", () => {
    const schema = getWorkforceBudgetSchema(t);
    const valid = { budgetCode: "WB-2027-001", workforcePlanId: 9, currencyCode: "EGP", lines: [{ workforcePlanLineId: 11, authorizedHeadcount: 2, allocatedSalaryBudget: 120000, allocatedRecruitmentBudget: 8000, periodAllocations: [{ fiscalPeriodId: 5, targetHeadcount: 2, allocatedSalaryCost: 120000, allocatedRecruitmentCost: 8000 }] }] };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodAllocations: [{ fiscalPeriodId: 5, targetHeadcount: 1, allocatedSalaryCost: 60000, allocatedRecruitmentCost: 4000 }, { fiscalPeriodId: 5, targetHeadcount: 1, allocatedSalaryCost: 60000, allocatedRecruitmentCost: 4000 }] }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], authorizedHeadcount: 3 }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], allocatedSalaryBudget: 100000 }] }).success).toBe(false);
  });
});
