import { describe, expect, it } from "vitest";
import {
  parseTenantAdminArrayResponse,
  parseTenantAdminPageResponse,
  parseTenantAdminResponse,
} from "./tenantAdminApiSchemas";

const admin = {
  id: "user-1",
  firstName: "Admin",
  lastName: "User",
  userName: "admin",
  email: "admin@example.com",
  isDisabled: false,
  isLocked: false,
  defaultTenantId: "tenant-1",
  tenants: [{ id: "tenant-1", identifier: "TENANT1", name: "Tenant One", isDefault: true }],
  companyIds: [1, 2],
  lifecycleStatus: "active",
  archivedOn: null,
  archiveReason: null,
} as const;

describe("tenant admin API response schemas", () => {
  it("parses admin entities, arrays, and management pages", () => {
    expect(parseTenantAdminResponse(admin)).toMatchObject({ id: "user-1", lifecycleStatus: "active" });
    expect(parseTenantAdminArrayResponse([admin])).toHaveLength(1);
    expect(parseTenantAdminPageResponse({
      items: [admin],
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

  it("rejects malformed privileged admin payloads", () => {
    expect(() => parseTenantAdminResponse({ ...admin, companyIds: ["1"] })).toThrow();
    expect(() => parseTenantAdminArrayResponse({ items: [admin] })).toThrow();
  });
});
