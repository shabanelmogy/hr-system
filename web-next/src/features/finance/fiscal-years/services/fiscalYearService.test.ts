import { apiRoutes } from "@/config";
import type { TFunction } from "i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFiscalYearSchema } from "../validation/fiscalYearValidation";
import { buildFiscalPeriodPreview } from "../utils/fiscalPeriodPreview";
import FiscalYearService from "./fiscalYearService";

const { get, post, put, remove } = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), put: vi.fn(), remove: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put, delete: remove },
}));

const request = {
  code: " fy-2027 ",
  nameAr: " السنة المالية 2027 ",
  nameEn: " Fiscal Year 2027 ",
  startDate: "2027-01-01",
  endDate: "2027-12-31",
  periodFrequency: 1 as const,
};

const t = ((key: string) => key) as TFunction;

describe("FiscalYearService", () => {
  beforeEach(() => {
    get.mockReset(); post.mockReset(); put.mockReset(); remove.mockReset();
  });

  it("normalizes create fields without leaking tenant or company scope", async () => {
    post.mockResolvedValue({ id: 7 });
    await FiscalYearService.create(request);
    expect(post).toHaveBeenCalledWith(apiRoutes.fiscalYears.create, {
      ...request,
      code: "FY-2027",
      nameAr: "السنة المالية 2027",
      nameEn: "Fiscal Year 2027",
    });
    expect(post.mock.calls[0][1]).not.toHaveProperty("tenantId");
    expect(post.mock.calls[0][1]).not.toHaveProperty("companyId");
  });

  it("sends optimistic concurrency and the exact lifecycle route", async () => {
    put.mockResolvedValue({ id: 7 });
    post.mockResolvedValue({ id: 7 });

    await FiscalYearService.update({ id: 7, request: { ...request, rowVersion: "AQ==" } });
    await FiscalYearService.changeLifecycle(7, "Ag==", "beginClosing");

    expect(put).toHaveBeenCalledWith(apiRoutes.fiscalYears.update(7), expect.objectContaining({
      code: "FY-2027",
      rowVersion: "AQ==",
    }));
    expect(post).toHaveBeenCalledWith(apiRoutes.fiscalYears.beginClosing(7), { rowVersion: "Ag==" });
  });

  it("mirrors the exact twelve-month rule in client validation", () => {
    const schema = getFiscalYearSchema(t);
    expect(schema.safeParse({ ...request, code: "FY-2027" }).success).toBe(true);
    const invalid = schema.safeParse({ ...request, code: "FY-2027", endDate: "2027-12-30" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues[0]?.path).toEqual(["endDate"]);
  });

  it("previews contiguous periods for an end-of-month fiscal start", () => {
    const periods = buildFiscalPeriodPreview("fy-odd", "2027-01-31", 1);
    expect(periods).toHaveLength(12);
    expect(periods[0]).toMatchObject({ code: "FY-ODD-P01", startDate: "2027-01-31", endDate: "2027-02-27" });
    expect(periods.at(-1)?.endDate).toBe("2028-01-30");
    periods.slice(1).forEach((period, index) => {
      const expected = new Date(`${periods[index]!.endDate}T00:00:00Z`);
      expected.setUTCDate(expected.getUTCDate() + 1);
      expect(period.startDate).toBe(expected.toISOString().slice(0, 10));
    });
  });
});
