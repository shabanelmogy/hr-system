import * as z from 'zod/mini';

const int32 = z.int().check(z.minimum(1), z.maximum(2147483647));
const count = z.int().check(z.minimum(0), z.maximum(2147483647));
const timestamp = z.string().check(
  z.regex(/^\d{4}-\d{2}-\d{2}T/),
  z.refine((value) => Number.isFinite(Date.parse(value))),
);
const state = z.object({
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  code: z.string().check(z.minLength(1)),
  countryId: int32,
});
const fields = {
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  code: z.string().check(z.minLength(1)),
  stateId: int32,
  state,
  createdOn: timestamp,
  updatedOn: z.nullable(timestamp),
  isDeleted: z.boolean(),
};
export const districtDetailSchema = z.object(fields);
export const districtListItemSchema = z.object({ ...fields, addressesCount: count });
export const districtLookupSchema = z.object({
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  code: z.string().check(z.minLength(1)),
  stateId: int32,
});
export type DistrictDetail = z.infer<typeof districtDetailSchema>;
export type DistrictListItem = z.infer<typeof districtListItemSchema>;
export type DistrictLookup = z.infer<typeof districtLookupSchema>;
export const districtStatuses = ['active', 'archived', 'all'] as const;
export const districtSearchFields = ['all', 'nameAr', 'nameEn', 'code', 'state'] as const;
export const districtSearchOperators = [
  'contains',
  'doesNotContain',
  'equals',
  'doesNotEqual',
  'startsWith',
  'endsWith',
] as const;
export const districtSortFields = ['id', 'nameEn', 'nameAr', 'code', 'state', 'createdOn'] as const;
export const districtQuerySchema = z.strictObject({
  pageNumber: int32,
  pageSize: z.int().check(z.minimum(1), z.maximum(5000)),
  search: z.string().check(z.maxLength(200)),
  searchField: z.enum(districtSearchFields),
  searchOperator: z.enum(districtSearchOperators),
  status: z.enum(districtStatuses),
  stateId: z.optional(int32),
  hasAddresses: z.optional(z.boolean()),
  sortBy: z.enum(districtSortFields),
  sortDirection: z.enum(['asc', 'desc']),
});
export type DistrictQuery = z.infer<typeof districtQuerySchema>;
export const defaultDistrictQuery: DistrictQuery = Object.freeze({
  pageNumber: 1,
  pageSize: 10,
  search: '',
  searchField: 'all',
  searchOperator: 'contains',
  status: 'active',
  sortBy: 'createdOn',
  sortDirection: 'desc',
});
const metadata = z.object({
  currentPage: int32,
  pageNumber: int32,
  pageSize: z.int().check(z.minimum(1), z.maximum(5000)),
  totalPages: count,
  totalCount: count,
  hasPrev: z.boolean(),
  hasNext: z.boolean(),
});
const pageSchema = z.object({
  items: z.array(districtListItemSchema).check(z.maxLength(5000)),
  metaData: metadata,
});
export type DistrictPage = z.infer<typeof pageSchema>;
export const parseDistrictId = (input: unknown) => int32.parse(input);
export function districtQueryParameters(input: unknown): {
  query: DistrictQuery;
  params: Record<string, string>;
} {
  const query = districtQuerySchema.parse(input),
    params: Record<string, string> = {
      pageNumber: String(query.pageNumber),
      pageSize: String(query.pageSize),
      status: query.status,
      searchField: query.searchField,
      searchOperator: query.searchOperator,
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    };
  if (query.search) params['search'] = query.search;
  if (query.stateId !== undefined) params['stateId'] = String(query.stateId);
  if (query.hasAddresses !== undefined) params['hasAddresses'] = String(query.hasAddresses);
  return { query: Object.freeze(query), params };
}
export function parseDistrictPage(input: unknown, request: DistrictQuery): DistrictPage {
  const page = pageSchema.parse(input),
    meta = page.metaData,
    expectedPages = Math.ceil(meta.totalCount / meta.pageSize);
  if (
    meta.currentPage !== request.pageNumber ||
    meta.pageNumber !== request.pageNumber ||
    meta.pageSize !== request.pageSize ||
    meta.totalPages !== expectedPages ||
    meta.hasPrev !== meta.currentPage > 1 ||
    meta.hasNext !== meta.currentPage < meta.totalPages ||
    page.items.length >
      Math.min(
        meta.pageSize,
        Math.max(0, meta.totalCount - (meta.currentPage - 1) * meta.pageSize),
      ) ||
    new Set(page.items.map((item) => item.id)).size !== page.items.length ||
    page.items.some(
      (item) =>
        item.state.id !== item.stateId ||
        (request.stateId !== undefined && item.stateId !== request.stateId) ||
        (request.hasAddresses !== undefined && item.addressesCount > 0 !== request.hasAddresses) ||
        (request.status === 'active' && item.isDeleted) ||
        (request.status === 'archived' && !item.isDeleted),
    )
  )
    throw Error('Invalid Districts page response');
  return page;
}
export function districtReadAllowed(
  actor: { readonly roles: readonly string[]; readonly permissions: readonly string[] } | null,
): boolean {
  return (
    !!actor &&
    actor.roles.some((role) => role.toLowerCase() === 'super_admin') &&
    actor.permissions.includes('Districts:View')
  );
}
