import { describe, expect, it } from "vitest";
import {
  parseTenantArrayResponse,
  parseTenantDashboardSummaryResponse,
  parseTenantPageResponse,
  parseTenantResponse,
} from "./tenantApiSchemas";

const tenant = {
  id: "tenant-1",
  identifier: "TENANT1",
  name: "Tenant One",
  isActive: true,
  subscriptionStatus: "active",
  subscriptionStartedOn: "2026-01-01T00:00:00Z",
  subscriptionEndsOn: null,
  planName: "Enterprise",
  maxAdmins: 5,
  maxUsers: 100,
  adminCount: 2,
  userCount: 20,
  totalUserCount: 22,
  companyCount: 3,
  billingEmail: null,
  contactName: null,
  contactPhone: null,
  notes: null,
  createdOn: "2026-01-01T00:00:00Z",
  updatedOn: null,
  lifecycleStatus: "active",
  archivedOn: null,
  archiveReason: null,
  purgeScheduledOn: null,
  rowVersion: "AAAAAA==",
  entitlements: [{ moduleCode: "HR", submoduleCodes: ["Core"] }],
} as const;

describe("tenant API response schemas", () => {
  it("parses tenant entities, arrays, and management pages", () => {
    expect(parseTenantResponse(tenant)).toMatchObject({ id: "tenant-1", subscriptionStatus: "active" });
    expect(parseTenantArrayResponse([tenant])).toHaveLength(1);
    expect(parseTenantPageResponse({
      items: [tenant],
      metaData: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 20,
        pageNumber: 1,
        totalCount: 1,
        hasPrev: false,
        hasNext: false,
      },
    }).items).toHaveLength(1);
  });

  it("rejects malformed privileged tenant payloads", () => {
    expect(() => parseTenantResponse({ ...tenant, maxUsers: "100" })).toThrow();
    expect(() => parseTenantArrayResponse({ items: [tenant] })).toThrow();
  });

  it("parses the dashboard summary contract", () => {
    const counts = Object.fromEntries(
      ["free", "trial", "active", "pastDue", "suspended", "expired", "cancelled"].map((key) => [key, 0]),
    );
    expect(parseTenantDashboardSummaryResponse({
      totalTenants: 1,
      enabledTenants: 1,
      admins: 2,
      users: 20,
      companies: 3,
      maxAdmins: 5,
      maxUsers: 100,
      expiringWithin30Days: 0,
      subscriptionStatusCounts: { ...counts, active: 1 },
      recentTenants: [{ id: "tenant-1", identifier: "TENANT1", name: "Tenant One", subscriptionStatus: "active" }],
      expiringWithin30DaysTenants: [],
    }).totalTenants).toBe(1);
  });
});
