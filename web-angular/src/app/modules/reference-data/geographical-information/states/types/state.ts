import * as z from 'zod/mini';

const int32 = z.int().check(z.minimum(1), z.maximum(2147483647));
const count = z.int().check(z.minimum(0), z.maximum(2147483647));
const timestamp = z.string().check(
  z.regex(/^\d{4}-\d{2}-\d{2}T/),
  z.refine((value) => Number.isFinite(Date.parse(value))),
);
const country = z.object({
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  isDeleted: z.boolean(),
});
const fields = {
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  code: z.string().check(z.minLength(1)),
  countryId: int32,
  country,
  createdOn: timestamp,
  updatedOn: z.nullable(timestamp),
  isDeleted: z.boolean(),
};
export const stateDetailSchema = z.object(fields);
export const stateListItemSchema = z.object({ ...fields, districtsCount: count });
export const stateLookupSchema = z.object({
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  code: z.string().check(z.minLength(1)),
  countryId: int32,
});
export type StateDetail = z.infer<typeof stateDetailSchema>;
export type StateListItem = z.infer<typeof stateListItemSchema>;
export type StateLookup = z.infer<typeof stateLookupSchema>;
export const stateStatuses = ['active', 'archived', 'all'] as const;
export const stateSearchFields = ['all', 'nameAr', 'nameEn', 'code', 'country'] as const;
export const stateSearchOperators = [
  'contains',
  'doesNotContain',
  'equals',
  'doesNotEqual',
  'startsWith',
  'endsWith',
] as const;
export const stateSortFields = ['nameEn', 'nameAr', 'code', 'country', 'createdOn'] as const;
export const stateQuerySchema = z.strictObject({
  pageNumber: int32,
  pageSize: z.int().check(z.minimum(1), z.maximum(5000)),
  search: z.string().check(z.maxLength(200)),
  searchField: z.enum(stateSearchFields),
  searchOperator: z.enum(stateSearchOperators),
  status: z.enum(stateStatuses),
  countryId: z.optional(int32),
  hasDistricts: z.optional(z.boolean()),
  sortBy: z.enum(stateSortFields),
  sortDirection: z.enum(['asc', 'desc']),
});
export type StateQuery = z.infer<typeof stateQuerySchema>;
export const defaultStateQuery: StateQuery = Object.freeze({
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
  items: z.array(stateListItemSchema).check(z.maxLength(5000)),
  metaData: metadata,
});
export type StatePage = z.infer<typeof pageSchema>;
export const parseStateId = (input: unknown) => int32.parse(input);
export function stateQueryParameters(input: unknown): {
  query: StateQuery;
  params: Record<string, string>;
} {
  const query = stateQuerySchema.parse(input),
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
  if (query.countryId !== undefined) params['countryId'] = String(query.countryId);
  if (query.hasDistricts !== undefined) params['hasDistricts'] = String(query.hasDistricts);
  return { query: Object.freeze(query), params };
}
export function parseStatePage(input: unknown, request: StateQuery): StatePage {
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
        item.country.id !== item.countryId ||
        (request.countryId !== undefined && item.countryId !== request.countryId) ||
        (request.hasDistricts !== undefined && item.districtsCount > 0 !== request.hasDistricts) ||
        (request.status === 'active' && item.isDeleted) ||
        (request.status === 'archived' && !item.isDeleted),
    )
  )
    throw Error('Invalid States page response');
  return page;
}
export function stateReadAllowed(
  actor: { readonly roles: readonly string[]; readonly permissions: readonly string[] } | null,
): boolean {
  return (
    !!actor &&
    actor.roles.some((role) => role.toLowerCase() === 'super_admin') &&
    actor.permissions.includes('States:View')
  );
}
