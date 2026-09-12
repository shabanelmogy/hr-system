import { apiService } from '@/src/core/api';
import { organizationalStructureEndpoints } from './organizational-structure-endpoints';
import {
  organizationalStructureBulkResponseSchema,
  organizationalStructureItemSchema,
  organizationalStructureLookupSchema,
  organizationalStructurePageSchema,
  organizationalChangeLogItemSchema,
} from './organizational-structure-schemas';
import type {
  ApproveJobDescriptionRequest,
  BulkCreateOrganizationalItemsResponse,
  OrganizationalChangeLogItem,
  OrganizationalResource,
  OrganizationalStructureItem,
  OrganizationalStructureLookup,
  OrganizationalStructurePage,
  OrganizationalStructureQuery,
  OrganizationalStructureRequest,
} from '../../domain/models/organizational-structure';

export interface OrganizationalStructureRemoteDataSource {
  getPage(query: OrganizationalStructureQuery): Promise<OrganizationalStructurePage>;
  getLookup(resource: OrganizationalResource, parentId?: number): Promise<OrganizationalStructureLookup[]>;
  create(resource: OrganizationalResource, request: OrganizationalStructureRequest): Promise<OrganizationalStructureItem>;
  bulkCreate(resource: OrganizationalResource, requests: readonly OrganizationalStructureRequest[]): Promise<BulkCreateOrganizationalItemsResponse>;
  update(resource: OrganizationalResource, id: number, request: OrganizationalStructureRequest): Promise<OrganizationalStructureItem>;
  archive(resource: OrganizationalResource, id: number): Promise<void>;
  restore(resource: OrganizationalResource, id: number): Promise<void>;
  approveJobDescription(id: number, request: ApproveJobDescriptionRequest): Promise<OrganizationalStructureItem>;
  rejectJobDescription(id: number, reason: string): Promise<OrganizationalStructureItem>;
  getChangeLogs(resource: OrganizationalResource, id: number): Promise<OrganizationalChangeLogItem[]>;
}

export function toOrganizationalStructureQuery(query: OrganizationalStructureQuery): string {
  const parameters = new URLSearchParams({
    pageNumber: String(query.pageNumber), pageSize: String(query.pageSize), status: query.status,
    searchField: query.searchField, searchOperator: query.searchOperator, sortBy: query.sortBy, sortDirection: query.sortDirection,
  });
  if (query.search.trim()) parameters.set('search', query.search.trim());
  if (query.parentId) parameters.set('parentId', String(query.parentId));
  return parameters.toString();
}
export const organizationalStructureRemoteDataSource: OrganizationalStructureRemoteDataSource = {
  async getPage(query) {
    return organizationalStructurePageSchema.parse(await apiService.get<unknown>(`${organizationalStructureEndpoints.base(query.resource)}?${toOrganizationalStructureQuery(query)}`));
  },
  async getLookup(resource, parentId) {
    const suffix = parentId ? `?parentId=${parentId}` : '';
    return organizationalStructureLookupSchema.parse(await apiService.get<unknown>(`${organizationalStructureEndpoints.lookup(resource)}${suffix}`));
  },
  async create(resource, request) {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, OrganizationalStructureRequest>(organizationalStructureEndpoints.base(resource), request));
  },
  async bulkCreate(resource, requests) {
    return organizationalStructureBulkResponseSchema.parse(await apiService.post<unknown, { items: readonly OrganizationalStructureRequest[] }>(organizationalStructureEndpoints.bulk(resource), { items: requests }));
  },
  async update(resource, id, request) {
    return organizationalStructureItemSchema.parse(await apiService.put<unknown, OrganizationalStructureRequest>(organizationalStructureEndpoints.byId(resource, id), request));
  },
  async archive(resource, id) { await apiService.delete<unknown>(organizationalStructureEndpoints.byId(resource, id)); },
  async restore(resource, id) { await apiService.post<unknown, undefined>(organizationalStructureEndpoints.restore(resource, id), undefined); },
  async approveJobDescription(id, request) {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, typeof request>(organizationalStructureEndpoints.approve(id), request));
  },
  async rejectJobDescription(id, reason) {
    return organizationalStructureItemSchema.parse(await apiService.post<unknown, { reason: string }>(organizationalStructureEndpoints.reject(id), { reason }));
  },
  async getChangeLogs(resource, id) {
    const raw = await apiService.get<unknown>(organizationalStructureEndpoints.changeLogs(resource, id));
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => organizationalChangeLogItemSchema.parse(item));
  },
};
