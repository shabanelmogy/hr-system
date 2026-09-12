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
} from '../models/organizational-structure';

export interface OrganizationalStructureRepository {
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
