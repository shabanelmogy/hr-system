import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRoutes } from "@/config/api";

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/shared/services/apiService", () => ({
  default: {
    get,
    post: vi.fn(),
    put: vi.fn(),
  },
}));

import { tenantApi } from "./tenantApi";
import { tenantKeys } from "./tenantQueryKeys";

describe("tenant dashboard summary client", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("uses the dedicated dashboard summary route and cache key", async () => {
    get.mockResolvedValue({ totalTenants: 0 });

    await tenantApi.getDashboardSummary();

    expect(get).toHaveBeenCalledWith(apiRoutes.tenants.getDashboardSummary);
    expect(tenantKeys.dashboardSummary()).toEqual(["tenants", "dashboard-summary"]);
  });
});
