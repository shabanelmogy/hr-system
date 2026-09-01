import { apiService, type PageResponse } from '@/src/core/api';
import { organizationalStructureEndpoints } from './organizational-structure-endpoints';
import { organizationalStructureBulkResponseSchema, organizationalStructureItemSchema, organizationalStructureLookupSchema, organizationalStructurePageSchema } from './organizational-structure-schemas';
import type { OrganizationalResource, OrganizationalStructureItem, OrganizationalStructureLookup, OrganizationalStructureQuery, OrganizationalStructureRequest } from '../types/organizational-structure';

export function toOrganizationalStructureQuery(query: OrganizationalStructureQuery): string {
  const parameters = new URLSearchParams({
    pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status,
    searchField: query.searchField, searchOperator: query.searchOperator, sortBy: query.sortBy, sortDirection: query.sortDirection,
  });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  if (query.parentId) parameters.set('parentId', String(query.parentId));
  return parameters.toString();
}
const normalize = (request: OrganizationalStructureRequest): OrganizationalStructureRequest => ({
  ...request, code: request.code.trim().toUpperCase(), nameEn: request.nameEn.trim(), nameAr: request.nameAr.trim(),
  version: request.version?.trim().toUpperCase(), currencyCode: request.currencyCode?.trim().toUpperCase(),
  costCenterCode: request.costCenterCode?.trim().toUpperCase(),
});
export const organizationalStructureApi = {
  async getPage(query: OrganizationalStructureQuery): Promise<PageResponse<OrganizationalStructureItem>> {
    return organizationalStructurePageSchema.parse(await apiService.get<unknown>(`${organizationalStructureEndpoints.base(query.resource)}?${toOrganizationalStructureQuery(query)}`));
  },
  async getLookup(resource: OrganizationalResource, parentId?: number): Promise<OrganizationalStructureLookup[]> {
    const suffix = parentId ? `?parentId=${parentId}` : '';
    return organizationalStructureLookupSchema.parse(await apiService.get<unknown>(`${organizationalStructureEndpoints.lookup(resource)}${suffix}`));
  },
  async create(resource: OrganizationalResource, request: OrganizationalStructureRequest): Promise<OrganizationalStructureItem> {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, OrganizationalStructureRequest>(organizationalStructureEndpoints.base(resource), normalize(request)));
  },
  async bulkCreate(resource: OrganizationalResource, requests: OrganizationalStructureRequest[]): Promise<{ createdCount: number }> {
    return organizationalStructureBulkResponseSchema.parse(await apiService.post<unknown, { items: OrganizationalStructureRequest[] }>(organizationalStructureEndpoints.bulk(resource), { items: requests.map(normalize) }));
  },
  async update(resource: OrganizationalResource, id: number, request: OrganizationalStructureRequest): Promise<OrganizationalStructureItem> {
    return organizationalStructureItemSchema.parse(await apiService.put<unknown, OrganizationalStructureRequest>(organizationalStructureEndpoints.byId(resource, id), normalize(request)));
  },
  async archive(resource: OrganizationalResource, id: number): Promise<void> { await apiService.delete<unknown>(organizationalStructureEndpoints.byId(resource, id)); },
  async restore(resource: OrganizationalResource, id: number): Promise<void> { await apiService.post<unknown, undefined>(organizationalStructureEndpoints.restore(resource, id), undefined); },
  async approve(id: number, request: { effectiveDate: string; expiryDate?: string }): Promise<OrganizationalStructureItem> {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, typeof request>(organizationalStructureEndpoints.approve(id), request));
  },
  async reject(id: number, reason: string): Promise<OrganizationalStructureItem> {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, { reason: string }>(organizationalStructureEndpoints.reject(id), { reason }));
  },
};
