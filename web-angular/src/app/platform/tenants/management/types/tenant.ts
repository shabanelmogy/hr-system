import * as z from 'zod/mini';
import { subscriptionStatuses } from '../../types/dashboard-contracts';

const int32 = z.int().check(z.minimum(1), z.maximum(2147483647));
const nonNegativeInt32 = z.int().check(z.minimum(0), z.maximum(2147483647));
const timestamp = z.string().check(
  z.regex(/^\d{4}-\d{2}-\d{2}T/),
  z.refine((value) => Number.isFinite(Date.parse(value))),
);
const optionalTimestamp = z.nullable(timestamp);
const entitlement = z.object({
  moduleCode: z.string().check(z.minLength(1), z.maxLength(100)),
  submoduleCodes: z
    .array(z.string().check(z.minLength(1), z.maxLength(100)))
    .check(z.maxLength(200)),
});

export const tenantLifecycleStatuses = ['active', 'archived', 'purgeScheduled'] as const;
export const tenantSortColumns = ['name', 'identifier', 'createdOn'] as const;
export const tenantSectionIds = [
  'identity',
  'subscription',
  'entitlements',
  'administrators',
] as const;
export type TenantSection = (typeof tenantSectionIds)[number];
export const tenantQuerySchema = z.strictObject({
  pageNumber: int32,
  pageSize: z.int().check(z.minimum(1), z.maximum(200)),
  columnName: z.enum(tenantSortColumns),
  operation: z.literal('Contains'),
  sortDirection: z.enum(['ASC', 'DESC']),
  searchValue: z.optional(z.string().check(z.maxLength(200))),
  includeArchived: z.boolean(),
});

export type TenantQuery = z.infer<typeof tenantQuerySchema>;
export const defaultTenantQuery: TenantQuery = Object.freeze({
  pageNumber: 1,
  pageSize: 10,
  columnName: 'name',
  operation: 'Contains',
  sortDirection: 'ASC',
  searchValue: '',
  includeArchived: false,
});

const tenantRecordSchema = z.object({
  id: z.string().check(z.minLength(1), z.maxLength(200)),
  identifier: z.string().check(z.minLength(1), z.maxLength(100)),
  name: z.string().check(z.minLength(1), z.maxLength(200)),
  isActive: z.boolean(),
  subscriptionStatus: z.enum(subscriptionStatuses),
  subscriptionStartedOn: timestamp,
  subscriptionEndsOn: optionalTimestamp,
  planName: z.nullable(z.string()),
  maxAdmins: int32,
  maxUsers: int32,
  adminCount: nonNegativeInt32,
  userCount: nonNegativeInt32,
  totalUserCount: nonNegativeInt32,
  companyCount: nonNegativeInt32,
  billingEmail: z.nullable(z.string()),
  contactName: z.nullable(z.string()),
  contactPhone: z.nullable(z.string()),
  notes: z.nullable(z.string()),
  createdOn: timestamp,
  updatedOn: optionalTimestamp,
  lifecycleStatus: z.enum(tenantLifecycleStatuses),
  archivedOn: optionalTimestamp,
  archiveReason: z.nullable(z.string()),
  purgeScheduledOn: optionalTimestamp,
  rowVersion: z.string().check(z.minLength(1), z.maxLength(1000)),
  entitlements: z.nullable(z.array(entitlement).check(z.maxLength(200))),
});

export type TenantRecord = z.infer<typeof tenantRecordSchema>;
export const tenantDetailSchema = tenantRecordSchema;

const pageSchema = z.object({
  items: z.array(tenantRecordSchema).check(z.maxLength(200)),
  metaData: z.object({
    currentPage: int32,
    totalPages: nonNegativeInt32,
    pageSize: z.int().check(z.minimum(1), z.maximum(200)),
    pageNumber: int32,
    totalCount: nonNegativeInt32,
    hasPrev: z.boolean(),
    hasNext: z.boolean(),
  }),
});

export type TenantPage = z.infer<typeof pageSchema>;

export function tenantQueryParameters(input: unknown): {
  readonly query: TenantQuery;
  readonly params: Record<string, string>;
} {
  const query = tenantQuerySchema.parse(input);
  const params: Record<string, string> = {
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    columnName: query.columnName,
    operation: query.operation,
    sortDirection: query.sortDirection,
    includeArchived: String(query.includeArchived),
  };
  if (query.searchValue) params['searchValue'] = query.searchValue;
  return { query: Object.freeze(query), params };
}

export function parseTenantDetail(input: unknown): TenantRecord {
  return tenantDetailSchema.parse(input);
}

export function parseTenantPage(input: unknown, request: TenantQuery): TenantPage {
  const page = pageSchema.parse(input);
  const { metaData } = page;
  const expectedPages = Math.ceil(metaData.totalCount / metaData.pageSize);
  if (
    metaData.currentPage !== request.pageNumber ||
    metaData.pageNumber !== request.pageNumber ||
    metaData.pageSize !== request.pageSize ||
    metaData.totalPages !== expectedPages ||
    metaData.hasPrev !== metaData.currentPage > 1 ||
    metaData.hasNext !== metaData.currentPage < metaData.totalPages ||
    page.items.length >
      Math.min(
        metaData.pageSize,
        Math.max(0, metaData.totalCount - (metaData.currentPage - 1) * metaData.pageSize),
      ) ||
    new Set(page.items.map((item) => item.id)).size !== page.items.length ||
    page.items.some((item) => !request.includeArchived && item.lifecycleStatus !== 'active')
  )
    throw Error('Invalid Tenant page response');
  return page;
}

export function parseTenantId(input: unknown): string {
  const id = z.string().check(z.minLength(1), z.maxLength(200)).parse(input).trim();
  if (!id) throw Error('Invalid Tenant identity');
  return id;
}

export function tenantReadAllowed(actor: { readonly roles: readonly string[] } | null): boolean {
  return !!actor && actor.roles.some((role) => role.trim().toLowerCase() === 'super_admin');
}

export const tenantSuperAdminAllowed = tenantReadAllowed;
