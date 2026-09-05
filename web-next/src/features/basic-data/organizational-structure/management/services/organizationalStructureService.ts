import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  OrganizationalResource,
  OrganizationalStructureItem,
  OrganizationalStructureLookup,
  OrganizationalStructureMutation,
  OrganizationalStructurePageQuery,
  OrganizationalStructurePageResponse,
  OrganizationalStructureBulkCreateResponse,
  UpdateOrganizationalStructureMutation,
  OrganizationalChangeLogItem,
} from "../types/OrganizationalStructure";

const normalizeRequest = (request: OrganizationalStructureMutation): OrganizationalStructureMutation => ({
  ...request,
  code: request.code.trim().toUpperCase(),
  nameEn: request.nameEn.trim(),
  nameAr: request.nameAr.trim(),
  version: request.version?.trim().toUpperCase(),
  currencyCode: request.currencyCode?.trim().toUpperCase(),
  costCenterCode: request.costCenterCode?.trim().toUpperCase(),
});

export const organizationalStructureService = {
  getPage(query: OrganizationalStructurePageQuery): Promise<OrganizationalStructurePageResponse> {
    const { resource, ...params } = query;
    return apiService.get(apiRoutes.organizationalStructure.page(resource), params);
  },
  getById(resource: OrganizationalResource, id: number): Promise<OrganizationalStructureItem> {
    return apiService.get(apiRoutes.organizationalStructure.getById(resource, id));
  },
  getLookup(resource: OrganizationalResource, parentId?: number): Promise<OrganizationalStructureLookup[]> {
    return apiService.get(apiRoutes.organizationalStructure.lookup(resource), parentId ? { parentId } : undefined);
  },
  create({ resource, request }: { resource: OrganizationalResource; request: OrganizationalStructureMutation }): Promise<OrganizationalStructureItem> {
    return apiService.post(apiRoutes.organizationalStructure.create(resource), normalizeRequest(request));
  },
  bulkCreate({ resource, requests }: { resource: OrganizationalResource; requests: OrganizationalStructureMutation[] }): Promise<OrganizationalStructureBulkCreateResponse> {
    return apiService.post(apiRoutes.organizationalStructure.bulkCreate(resource), { items: requests.map(normalizeRequest) });
  },
  update({ resource, id, request }: UpdateOrganizationalStructureMutation): Promise<OrganizationalStructureItem> {
    return apiService.put(apiRoutes.organizationalStructure.update(resource, id), normalizeRequest(request));
  },
  async archive({ resource, id }: { resource: OrganizationalResource; id: number }): Promise<number> {
    await apiService.delete(apiRoutes.organizationalStructure.archive(resource, id));
    return id;
  },
  async restore({ resource, id }: { resource: OrganizationalResource; id: number }): Promise<number> {
    await apiService.post(apiRoutes.organizationalStructure.restore(resource, id));
    return id;
  },
  approve(id: number, effectiveDate: string, expiryDate?: string): Promise<OrganizationalStructureItem> {
    return apiService.post(apiRoutes.organizationalStructure.approve(id), { effectiveDate, expiryDate: expiryDate || null });
  },
  reject(id: number, reason: string): Promise<OrganizationalStructureItem> {
    return apiService.post(apiRoutes.organizationalStructure.reject(id), { reason });
  },
  getChangeLogs(resource: OrganizationalResource, id: number): Promise<OrganizationalChangeLogItem[]> {
    return apiService.get(apiRoutes.organizationalStructure.changeLogs(resource, id));
  },
};
