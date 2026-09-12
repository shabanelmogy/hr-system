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
} from '../domain/models/organizational-structure';
import {
  normalizeOrganizationalStructureRequest,
  normalizeOrganizationalStructureRequests,
} from '../domain/policies/organizational-structure-request-policy';
import type { OrganizationalStructureRepository } from '../domain/repositories/organizational-structure-repository';

export interface SaveOrganizationalItemInput {
  resource: OrganizationalResource;
  id: number | null;
  request: OrganizationalStructureRequest;
}

export interface OrganizationalStructureUseCases {
  getPage(query: OrganizationalStructureQuery): Promise<OrganizationalStructurePage>;
  getLookup(resource: OrganizationalResource, parentId?: number): Promise<OrganizationalStructureLookup[]>;
  save(input: SaveOrganizationalItemInput): Promise<OrganizationalStructureItem>;
  bulkCreate(resource: OrganizationalResource, requests: readonly OrganizationalStructureRequest[]): Promise<BulkCreateOrganizationalItemsResponse>;
  archive(resource: OrganizationalResource, id: number): Promise<void>;
  restore(resource: OrganizationalResource, id: number): Promise<void>;
  approveJobDescription(id: number, request: ApproveJobDescriptionRequest): Promise<OrganizationalStructureItem>;
  rejectJobDescription(id: number, reason: string): Promise<OrganizationalStructureItem>;
  getChangeLogs(resource: OrganizationalResource, id: number): Promise<OrganizationalChangeLogItem[]>;
}

export function createOrganizationalStructureUseCases(
  repository: OrganizationalStructureRepository,
): OrganizationalStructureUseCases {
  return {
    getPage: (query) => repository.getPage(query),
    getLookup: (resource, parentId) => repository.getLookup(resource, parentId),
    save: ({ resource, id, request }) => {
      const normalized = normalizeOrganizationalStructureRequest(request);
      return id === null
        ? repository.create(resource, normalized)
        : repository.update(resource, id, normalized);
    },
    bulkCreate: (resource, requests) => repository.bulkCreate(
      resource,
      normalizeOrganizationalStructureRequests(requests),
    ),
    archive: (resource, id) => repository.archive(resource, id),
    restore: (resource, id) => repository.restore(resource, id),
    approveJobDescription: (id, request) => repository.approveJobDescription(id, request),
    rejectJobDescription: (id, reason) => repository.rejectJobDescription(id, reason),
    getChangeLogs: (resource, id) => repository.getChangeLogs(resource, id),
  };
}
