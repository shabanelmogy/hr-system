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
    get.mockResolvedValue({
      totalTenants: 0,
      enabledTenants: 0,
      admins: 0,
      users: 0,
      companies: 0,
      maxAdmins: 0,
      maxUsers: 0,
      expiringWithin30Days: 0,
      subscriptionStatusCounts: {
        free: 0,
        trial: 0,
        active: 0,
        pastDue: 0,
        suspended: 0,
        expired: 0,
        cancelled: 0,
      },
      recentTenants: [],
      expiringWithin30DaysTenants: [],
    });

    await tenantApi.getDashboardSummary();

    expect(get).toHaveBeenCalledWith(apiRoutes.tenants.getDashboardSummary);
    expect(tenantKeys.dashboardSummary()).toEqual(["tenants", "dashboard-summary"]);
  });
});
