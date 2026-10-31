import { countryFiltersValid,parseCountryFilters } from './country-filters';
import type { GridFilters } from '../../../../../shared/data/public-api';
import * as z from 'zod/mini';

const int32 = z.int().check(z.minimum(1), z.maximum(2147483647));
const count = z.int().check(z.minimum(0), z.maximum(2147483647));
const code = z.nullable(z.string());
const timestamp = z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}T/), z.refine(value => Number.isFinite(Date.parse(value))));
const fields = {
  id: int32, nameAr: z.string().check(z.minLength(1)), nameEn: z.string().check(z.minLength(1)),
  alpha2Code: code, alpha3Code: code, phoneCode: code, currencyCode: code,
  createdOn: timestamp, updatedOn: z.nullable(timestamp), isDeleted: z.boolean(),
};
export const countryDetailSchema = z.object(fields);
export const countryListItemSchema = z.object({ ...fields, statesCount: count });
export type CountryDetail = z.infer<typeof countryDetailSchema>;
export type CountryListItem = z.infer<typeof countryListItemSchema>;
export const countryStatuses = ['active', 'archived', 'all'] as const;
export const countrySearchFields = ['all', 'nameAr', 'nameEn', 'alpha2Code', 'alpha3Code', 'phoneCode', 'currencyCode'] as const;
export const countrySearchOperators = ['contains', 'doesNotContain', 'equals', 'doesNotEqual', 'startsWith', 'endsWith'] as const;
export const countrySortFields = ['nameEn', 'nameAr', 'alpha2Code', 'alpha3Code', 'currencyCode', 'createdOn'] as const;
export const countryQuerySchema = z.strictObject({
  pageNumber: int32, pageSize: z.int().check(z.minimum(1), z.maximum(5000)),
  search: z.string().check(z.maxLength(200)), searchField: z.enum(countrySearchFields),
  searchOperator: z.enum(countrySearchOperators), status: z.enum(countryStatuses),
  sortBy: z.enum(countrySortFields), sortDirection: z.enum(['asc', 'desc']),
  filters: z.optional(z.custom<GridFilters>(countryFiltersValid)),
  currencyCode: z.optional(z.string().check(z.regex(/^[A-Za-z]{3}$/))), hasStates: z.optional(z.boolean()),
});
export type CountryQuery = z.infer<typeof countryQuerySchema>;
export const defaultCountryQuery: CountryQuery = Object.freeze({
  pageNumber: 1, pageSize: 10, search: '', searchField: 'all', searchOperator: 'contains',
  status: 'active', sortBy: 'createdOn', sortDirection: 'desc',
});
const metadataSchema = z.object({
  currentPage: int32, pageNumber: int32, pageSize: z.int().check(z.minimum(1), z.maximum(5000)),
  totalPages: count, totalCount: count, hasPrev: z.boolean(), hasNext: z.boolean(),
});
const pageSchema = z.object({ items: z.array(countryListItemSchema).check(z.maxLength(5000)), metaData: metadataSchema });
export type CountryPage = z.infer<typeof pageSchema>;

export function parseCountryPage(input: unknown, request: CountryQuery): CountryPage {
  const page = pageSchema.parse(input), meta = page.metaData;
  const expectedPages = Math.ceil(meta.totalCount / meta.pageSize);
  if (meta.currentPage !== request.pageNumber || meta.pageNumber !== request.pageNumber || meta.pageSize !== request.pageSize ||
      meta.totalPages !== expectedPages || meta.hasPrev !== (meta.currentPage > 1) || meta.hasNext !== (meta.currentPage < meta.totalPages) ||
      page.items.length > Math.min(meta.pageSize, Math.max(0, meta.totalCount - (meta.currentPage - 1) * meta.pageSize)) ||
      new Set(page.items.map(row => row.id)).size !== page.items.length ||
      page.items.some(row => request.status === 'active' ? row.isDeleted : request.status === 'archived' ? !row.isDeleted : false)) {
    throw new Error('Invalid Countries page response');
  }
  return page;
}

export function countryQueryParameters(input: unknown): { query: CountryQuery; params: Record<string, string> } {
  const parsed=countryQuerySchema.parse(input);
  const query=parsed.filters?{...parsed,filters:parseCountryFilters(parsed.filters)}:parsed;
  const params: Record<string, string> = {
    pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status,
    searchField: query.searchField, searchOperator: query.searchOperator,
    sortBy: query.sortBy, sortDirection: query.sortDirection,
  };
  if (query.search !== '') params['search'] = query.search;
  if (query.currencyCode !== undefined) params['currencyCode'] = query.currencyCode.toUpperCase();
  if (query.hasStates !== undefined) params['hasStates'] = String(query.hasStates);
  return { query: Object.freeze(query), params };
}

export const parseCountryId = (input: unknown) => int32.parse(input);
export function countryReadAllowed(actor: { readonly roles: readonly string[]; readonly permissions: readonly string[] } | null): boolean {
  return !!actor && actor.roles.some(role => role.toLowerCase() === 'super_admin') && actor.permissions.includes('Countries:View');
}
export function countryQuality(country: CountryDetail): number {
  return Math.min(100, 50 + (country.nameAr ? 15 : 0) + (country.nameEn ? 15 : 0) +
    [country.alpha2Code, country.alpha3Code, country.phoneCode, country.currencyCode].filter(Boolean).length * 5);
}
