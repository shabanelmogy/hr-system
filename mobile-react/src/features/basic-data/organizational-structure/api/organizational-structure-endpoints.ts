import type { OrganizationalResource } from '../types/organizational-structure';

const base = (resource: OrganizationalResource) => `/v1/organizational-structure/${resource}`;
export const organizationalStructureEndpoints = {
  base,
  bulk: (resource: OrganizationalResource) => `${base(resource)}/bulk`,
  lookup: (resource: OrganizationalResource) => `${base(resource)}/lookup`,
  byId: (resource: OrganizationalResource, id: number) => `${base(resource)}/${id}`,
  restore: (resource: OrganizationalResource, id: number) => `${base(resource)}/${id}/restore`,
  approve: (id: number) => `${base('job-descriptions')}/${id}/approve`,
  reject: (id: number) => `${base('job-descriptions')}/${id}/reject`,
};
