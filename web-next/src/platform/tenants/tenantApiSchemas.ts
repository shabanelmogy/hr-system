import { z } from "zod";
import { createManagementPageResponseSchema } from "@/lib/api/managementPageSchema";
import { subscriptionStatuses } from "./types";
import type {
  TenantDashboardSummaryResponse,
  TenantManagementResponse,
} from "./types";
import type { ManagementPageResponse } from "@/lib/api/pagination";

const subscriptionStatusSchema = z.enum(subscriptionStatuses);

const tenantEntitlementSchema = z.object({
  moduleCode: z.string(),
  submoduleCodes: z.array(z.string()),
});

const tenantManagementSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  subscriptionStatus: subscriptionStatusSchema,
  subscriptionStartedOn: z.string(),
  subscriptionEndsOn: z.string().nullable(),
  planName: z.string().nullable(),
  maxAdmins: z.number(),
  maxUsers: z.number(),
  adminCount: z.number(),
  userCount: z.number(),
  totalUserCount: z.number(),
  companyCount: z.number(),
  billingEmail: z.string().nullable(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
  notes: z.string().nullable(),
  createdOn: z.string(),
  updatedOn: z.string().nullable(),
  lifecycleStatus: z.enum(["active", "archived", "purgeScheduled"]),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
  purgeScheduledOn: z.string().nullable(),
  rowVersion: z.string(),
  entitlements: z.array(tenantEntitlementSchema).nullable().optional(),
});

const tenantPageSchema = createManagementPageResponseSchema(tenantManagementSchema);

const tenantDashboardSummarySchema = z.object({
  totalTenants: z.number(),
  enabledTenants: z.number(),
  admins: z.number(),
  users: z.number(),
  companies: z.number(),
  maxAdmins: z.number(),
  maxUsers: z.number(),
  expiringWithin30Days: z.number(),
  subscriptionStatusCounts: z.record(subscriptionStatusSchema, z.number()),
  recentTenants: z.array(z.object({
    id: z.string(),
    identifier: z.string(),
    name: z.string(),
    subscriptionStatus: subscriptionStatusSchema,
  })),
  expiringWithin30DaysTenants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    planName: z.string().nullable(),
    subscriptionEndsOn: z.string(),
  })),
});

export function parseTenantResponse(value: unknown): TenantManagementResponse {
  return tenantManagementSchema.parse(value);
}

export function parseTenantArrayResponse(value: unknown): TenantManagementResponse[] {
  return z.array(tenantManagementSchema).parse(value);
}

export function parseTenantPageResponse(value: unknown): ManagementPageResponse<TenantManagementResponse> {
  return tenantPageSchema.parse(value);
}

export function parseTenantDashboardSummaryResponse(value: unknown): TenantDashboardSummaryResponse {
  return tenantDashboardSummarySchema.parse(value);
}
