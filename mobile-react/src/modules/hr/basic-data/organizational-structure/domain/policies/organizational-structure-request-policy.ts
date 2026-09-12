import type { OrganizationalStructureRequest } from '../models/organizational-structure';

export function normalizeOrganizationalStructureRequest(
  request: OrganizationalStructureRequest,
): OrganizationalStructureRequest {
  return {
    ...request,
    code: request.code.trim().toUpperCase(),
    nameEn: request.nameEn.trim(),
    nameAr: request.nameAr.trim(),
    version: request.version?.trim().toUpperCase(),
    currencyCode: request.currencyCode?.trim().toUpperCase(),
    costCenterCode: request.costCenterCode?.trim().toUpperCase(),
  };
}

export function normalizeOrganizationalStructureRequests(
  requests: readonly OrganizationalStructureRequest[],
): OrganizationalStructureRequest[] {
  return requests.map(normalizeOrganizationalStructureRequest);
}
