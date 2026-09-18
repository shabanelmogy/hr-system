import { z } from "zod";
import { createManagementPageResponseSchema } from "@/lib/api/managementPageSchema";
import type { ManagementPageResponse } from "@/lib/api/pagination";
import type { TenantAdminResponse } from "./types";

const tenantAdminTenantSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
});

const tenantAdminSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  isDisabled: z.boolean(),
  isLocked: z.boolean(),
  defaultTenantId: z.string(),
  tenants: z.array(tenantAdminTenantSchema),
  companyIds: z.array(z.number().int()),
  lifecycleStatus: z.enum(["active", "archived"]),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
});

const tenantAdminPageSchema = createManagementPageResponseSchema(tenantAdminSchema);

export function parseTenantAdminResponse(value: unknown): TenantAdminResponse {
  return tenantAdminSchema.parse(value);
}

export function parseTenantAdminArrayResponse(value: unknown): TenantAdminResponse[] {
  return z.array(tenantAdminSchema).parse(value);
}

export function parseTenantAdminPageResponse(value: unknown): ManagementPageResponse<TenantAdminResponse> {
  return tenantAdminPageSchema.parse(value);
}
