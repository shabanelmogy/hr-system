import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkforceTraceService from "./workforceTraceService";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get } }));

describe("WorkforceTraceService", () => {
  beforeEach(() => get.mockReset());

  it("parses trace nodes and edges and keeps commitment pagination in the request", async () => {
    get.mockResolvedValueOnce({
      nodes: [{ key: "application-2", kind: "EmploymentApplication", title: "APP-2", status: "OfferAccepted" }],
      edges: [],
    });
    get.mockResolvedValueOnce({
      items: [],
      metaData: { currentPage: 2, pageNumber: 2, pageSize: 25, totalCount: 26, totalPages: 2 },
    });

    await expect(WorkforceTraceService.getByApplication(2)).resolves.toMatchObject({ nodes: [{ key: "application-2" }] });
    await expect(WorkforceTraceService.getPlanCommitment({ fiscalYearId: 4, pageNumber: 2, pageSize: 25 })).resolves.toMatchObject({ metaData: { pageNumber: 2 } });
    expect(get).toHaveBeenNthCalledWith(1, apiRoutes.workforcePlanning.traceByApplication(2));
    expect(get).toHaveBeenNthCalledWith(2, apiRoutes.workforcePlanning.planCommitment, { fiscalYearId: 4, pageNumber: 2, pageSize: 25 });
  });
});
