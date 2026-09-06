import { apiRoutes } from "@/config";
import type { TFunction } from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWorkforcePlanSchema } from "../validation/workforcePlanValidation";
import WorkforcePlanService from "./workforcePlanService";

const { get, post, put, remove } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), remove: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get, post, put, delete: remove } }));
const t = ((key: string) => key) as TFunction;

describe("WorkforcePlanService", () => {
  beforeEach(() => { get.mockReset(); post.mockReset(); put.mockReset(); remove.mockReset(); });

  it("sends row version on every lifecycle command", async () => {
    post.mockResolvedValue({ id: 7 });
    await WorkforcePlanService.submit({ id: 7, rowVersion: "AQ==" });
    await WorkforcePlanService.beginReview({ id: 7, rowVersion: "Ag==" });
    await WorkforcePlanService.approve({ id: 7, rowVersion: "Aw==" });
    await WorkforcePlanService.reject({ id: 7, rowVersion: "BA==", reason: "Revise" });
    await WorkforcePlanService.createRevision({ id: 7, rowVersion: "BQ==" });

    expect(post).toHaveBeenNthCalledWith(1, apiRoutes.workforcePlanning.submit(7), { rowVersion: "AQ==" });
    expect(post).toHaveBeenNthCalledWith(2, apiRoutes.workforcePlanning.beginReview(7), { rowVersion: "Ag==" });
    expect(post).toHaveBeenNthCalledWith(3, apiRoutes.workforcePlanning.approve(7), { rowVersion: "Aw==" });
    expect(post).toHaveBeenNthCalledWith(4, apiRoutes.workforcePlanning.reject(7), { rowVersion: "BA==", reason: "Revise" });
    expect(post).toHaveBeenNthCalledWith(5, apiRoutes.workforcePlanning.revisions(7), { rowVersion: "BQ==" });
  });

  it("sends row version when archiving and restoring", async () => {
    remove.mockResolvedValue(undefined);
    post.mockResolvedValue({ id: 7 });

    await WorkforcePlanService.archive({ id: 7, rowVersion: "AQ==" });
    await WorkforcePlanService.restore({ id: 7, rowVersion: "Ag==" });

    expect(remove).toHaveBeenCalledWith(apiRoutes.workforcePlanning.plan(7), { rowVersion: "AQ==" });
    expect(post).toHaveBeenCalledWith(apiRoutes.workforcePlanning.restore(7), { rowVersion: "Ag==" });
  });

  it("rejects duplicate periods and mismatched period totals before submission", () => {
    const schema = getWorkforcePlanSchema(t);
    const valid = { planCode: "WP-2027", fiscalYearId: 1, titleEn: "Plan", titleAr: "خطة", description: "", lines: [{ positionId: 1, targetBranchId: null, newHireSlots: 2, replacementSlots: 1, justification: "", periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 2, replacementSlots: 1 }] }] };
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 0 }, { fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 0 }] }] }).success).toBe(false);
    expect(schema.safeParse({ ...valid, lines: [{ ...valid.lines[0], periodTargets: [{ fiscalPeriodId: 10, newHireSlots: 1, replacementSlots: 2 }] }] }).success).toBe(false);
  });
});
